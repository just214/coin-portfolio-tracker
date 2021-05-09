import { InferGetServerSidePropsType } from "next";
// import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AirTableTransactionRecord, CoinGeckoData, CoinData } from "../types";
import { groupBy } from "lodash";
import { toNum, toUsd } from "../utils";
import { Layout } from "../components/Layout";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import * as Collapsible from "@radix-ui/react-collapsible";

type AppProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const App = (props: AppProps) => {
  const [coingeckoData, setCoingeckoData] = useState<CoinGeckoData>(null);
  const [data, setData] = useState<CoinData[]>([]);

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
    }, 1000);
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
      <header className="py-4 text-white text-center my-2 bg-gray-900">
        <p className="text-sm">TOTAL VALUE</p>
        <h1 className="text-2xl">{toUsd(totalValue)}</h1>
      </header>

      {data.map((value) => {
        if (!coingeckoData[value.coinId]) return;
        const { usd, usd_24h_change } = coingeckoData[value.coinId];

        return (
          <Collapsible.Root key={value.coinId}>
            <Collapsible.Button className="px-2 py-1 my-2 block w-full border-b border-gray-800 font-medium">
              <div className="flex items-center justify-between text-sm">
                <div className="text-left flex-1">
                  <p>{value.coinName}</p>
                  <p className="text-xs text-gray-400">{value.coinSymbol}</p>
                </div>
                <div className="text-right flex-1">
                  <p className="text-sm">{toUsd(usd)}</p>

                  <span
                    className={`
                text-sm
                justify-end
                flex
                items-center
                ${usd_24h_change > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {usd_24h_change > 0 ? (
                      <FaCaretUp className="fill-current" />
                    ) : (
                      <FaCaretDown className="fill-current" />
                    )}
                    {usd_24h_change.toFixed(2)}%
                  </span>
                </div>
                <div className="children:text-right flex-1 text-blue-200">
                  <p>{toUsd(value.total * usd, true)}</p>
                  <p className="text-xxs">
                    {toNum(value.total)} {value.coinSymbol}
                  </p>
                </div>
              </div>

              <Collapsible.Content>
                <ul className="mt-4">
                  {value.transactions.map((transaction) => {
                    return (
                      <li
                        key={transaction.wallet}
                        className="text-xs text-gray-700 flex items-center text-left"
                      >
                        <p className="w-28 font-medium">{transaction.wallet}</p>

                        <div className="flex items-center">
                          <span className="inline-block w-20">
                            {toNum(transaction.quantity)}
                          </span>

                          <p>
                            {value.coinSymbol} ={" "}
                            {toUsd(transaction.quantity * usd)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Collapsible.Content>
            </Collapsible.Button>
          </Collapsible.Root>
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
