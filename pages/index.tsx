import { InferGetServerSidePropsType } from "next";
// import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AirTableTransactionRecord, CoinGeckoData, CoinData } from "../types";
import { groupBy } from "lodash";
import { toUsd, toNum } from "../utils";
import { Layout } from "../components/Layout";
import { Collapse } from "../components/Collapse";

type AppProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const App = (props: AppProps) => {
  const [coingeckoData, setCoingeckoData] = useState<CoinGeckoData>(null);
  const [data, setData] = useState<CoinData[]>([]);
  // const { query } = useRouter();
  // console.log(query);
  useEffect(() => {
    async function fetchCoinGeckoData() {
      const res = await fetch(props.coingecko_endpoint, {
        method: "GET",
        headers: { accept: "application/json" },
      });
      const values = (await res.json()) as CoinGeckoData;
      setCoingeckoData(values);
    }
    const interval = setInterval(async () => {
      fetchCoinGeckoData();
    }, 10000);
    fetchCoinGeckoData();

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const groupedCoinData = groupBy(
      props.airtable_records,
      (value) => value.fields.CoinID
    );

    const arrayWithTotals = Object.keys(groupedCoinData).map((key) => {
      const values = groupedCoinData[key];
      const { CoinName, CoinSymbol, CoinID } = values[0].fields;
      return {
        coinName: CoinName[0],
        coinSymbol: CoinSymbol[0],
        coinId: CoinID[0],
        total: values.reduce((acc, value) => {
          return acc + value.fields.Quantity;
        }, 0),
        transactions: values.map((value) => {
          return {
            wallet: value.fields.WalletName[0],
            quantity: value.fields.Quantity,
          };
        }),
      };
    });

    if (!coingeckoData) return;

    setData(
      arrayWithTotals.sort((a, b) => {
        return (
          b.total * coingeckoData[b.coinId]?.usd -
          a.total * coingeckoData[a.coinId]?.usd
        );
      })
    );
  }, [coingeckoData]);

  if (!coingeckoData) return null;

  const totalValue = data.reduce((acc, value) => {
    return acc + value.total * (coingeckoData[value.coinId]?.usd || 0);
  }, 0);

  return (
    <Layout>
      <header className="py-4 text-white">
        <h1 className="text-4xl">{toUsd(totalValue)}</h1>
      </header>

      {data.map((value) => {
        if (!coingeckoData[value.coinId]) return;
        const { usd, usd_24h_change } = coingeckoData[value.coinId];

        return (
          <div className="bg-white rounded-lg my-2 p-3" key={value.coinId}>
            <p className="flex items-center justify-between">
              <span className="font-bold">{value.coinName}</span>
              <span>{toUsd(usd)}</span>
              <span
                className={
                  usd_24h_change > 0 ? "text-green-500" : "text-red-500"
                }
              >
                {usd_24h_change.toFixed(2)}%
              </span>
            </p>
            <div className="text-center my-4">
              <p className="text(gray-600 center) font-bold rounded-full bg-green-100 px-2 inline-block">
                {toNum(value.total)} {value.coinSymbol} ={" "}
                {toUsd(value.total * usd)}
              </p>
            </div>

            <Collapse title="View More">
              <ul>
                {value.transactions.map((transaction) => {
                  return (
                    <li
                      key={transaction.wallet}
                      className="text-xs text-gray-500 flex items-center"
                    >
                      <p className="w-28">{transaction.wallet}</p>

                      <p>{toNum(transaction.quantity)}</p>

                      <p>
                        {value.coinSymbol} = {toUsd(transaction.quantity * usd)}
                      </p>

                      <hr />
                    </li>
                  );
                })}
              </ul>
            </Collapse>
          </div>
        );
      })}
    </Layout>
  );
};

export async function getServerSideProps() {
  const response = await fetch(process.env.AIRTABLE_API_ENDPOINT, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  const { records } = await response.json();
  const coinIds = [
    // @ts-ignore
    ...new Set(records.map((value) => value.fields.CoinID[0])),
  ].join(",");

  const coingecko_endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;

  return {
    props: {
      airtable_records: records,
      coingecko_endpoint,
    },
  } as {
    props: {
      airtable_records: AirTableTransactionRecord[];
      coingecko_endpoint: string;
    };
  };
}

export default App;
