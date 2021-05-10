import { PushSpinner } from "react-spinners-kit";
import { useEffect, useState } from "react";
import { CoinGeckoData, CoinData } from "../types";
import { groupBy } from "lodash";
import { toNum, toUsd, fetchAirtableData } from "../utils";
import { Layout } from "../components/Layout";
import { FaCaretUp, FaCaretDown, FaPlus, FaMinus } from "react-icons/fa";
import * as Accordion from "@radix-ui/react-accordion";
import { css, tw, animation } from "twind/css";

const slideDownAnimation = animation("150ms ease-in-out", {
  from: { height: "0px" },
  to: { height: "var(--radix-accordion-panel-height)" },
});

const slideUpAnimation = animation("150ms ease-in-out", {
  from: { height: "var(--radix-accordion-panel-height)" },
  to: { height: "0px" },
});

const App = (props) => {
  const { airtableRecords } = props;
  const [coingeckoData, setCoingeckoData] = useState<CoinGeckoData>(null);
  const [data, setData] = useState<CoinData[]>([]);
  const [totalValueInUsd, setTotalValueInUsd] = useState<number>(null);
  const [expandedCoinIds, setExpandedCoinIds] = useState([]);

  // Fetch the CoinGecko coin info for each coin in Airtable...on an interval every second
  useEffect(() => {
    if (!airtableRecords) return;
    async function fetchCoinGeckoData() {
      try {
        const coinIds = [
          // @ts-ignore
          ...new Set(airtableRecords.map((value) => value.fields.CoinID[0])),
        ].join(",");

        const coingecko_endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
        const res = await fetch(coingecko_endpoint, {
          method: "GET",
          headers: { accept: "application/json" },
        });
        const values = (await res.json()) as CoinGeckoData;
        return values;
      } catch (error) {
        console.error("COINGECKO ERROR", error);
        return error;
      }
    }
    const interval = setInterval(async () => {
      const data = await fetchCoinGeckoData();
      setCoingeckoData(data);
    }, 1000);
    fetchCoinGeckoData();

    return () => {
      clearInterval(interval);
    };
  }, [airtableRecords]);

  // Step 3. Massage the Airtable and Coin Gecko data into the final data objects and save as state for rendering
  useEffect(() => {
    const groupedCoinData = groupBy(
      airtableRecords,
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
        allocations: values
          .map((value) => {
            return {
              walletName: value.fields.WalletName[0],
              coinQuantity: value.fields.Quantity,
            };
          })
          .sort((a, b) => (a.coinQuantity > b.coinQuantity ? -1 : 1)),
      };
    });

    if (!coingeckoData) return;

    const totalValue = arrayWithTotals.reduce((acc, value) => {
      return acc + value.total * (coingeckoData[value.coinId]?.usd || 0);
    }, 0);

    setTotalValueInUsd(totalValue);

    setData(
      arrayWithTotals.sort((a, b) => {
        return b.total * coingeckoData[b.coinId]?.usd <
          a.total * coingeckoData[a.coinId]?.usd
          ? -1
          : 1;
      })
    );
  }, [coingeckoData]);

  if (!data.length)
    return (
      <div className="flex items-center justify-center h-screen">
        <PushSpinner />
      </div>
    );

  return (
    <Layout>
      <header className="py-4 text-blue-200 text-center my-2 bg-gray-900 sticky top-0 shadow-lg">
        <h1 className="text-2xl font-bold">{toUsd(totalValueInUsd)}</h1>
      </header>

      <Accordion.Root type="multiple" onValueChange={setExpandedCoinIds}>
        {data.map((value) => {
          const isExpanded = expandedCoinIds.includes(value.coinId);
          const ExpandCollapseIcon = isExpanded ? FaMinus : FaPlus;
          if (!coingeckoData[value.coinId]) return;
          const { usd, usd_24h_change } = coingeckoData[value.coinId];

          return (
            <Accordion.Item
              key={value.coinId}
              value={value.coinId}
              className={`transition-colors duration-200 my-3 border-b border-gray-700 py-1`}
            >
              <Accordion.Header>
                <Accordion.Button
                  className={`w-full ring-0! outline-none!  px-2 py-1`}
                >
                  <div className="flex items-center justify-between text-sm px-2">
                    <div className="text-left flex-1">
                      <p>{value.coinName}</p>
                      <p className="text-xs text-gray-400">
                        {value.coinSymbol}
                      </p>
                    </div>
                    <div className="text-right flex-1 mx-2">
                      <p className="text-sm">{toUsd(usd)}</p>

                      <span
                        className={`text-sm justify-end flex items-center ${
                          usd_24h_change > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {usd_24h_change > 0 ? (
                          <FaCaretUp className="fill-current" />
                        ) : (
                          <FaCaretDown className="fill-current" />
                        )}
                        {Math.abs(usd_24h_change).toFixed(2)}%
                      </span>
                    </div>
                    <div className="children:text-right flex-1 text-blue-200 mx-2">
                      <p>{toUsd(value.total * usd)}</p>
                      <p className="text-xxs">
                        {toNum(value.total)} {value.coinSymbol}
                      </p>
                    </div>
                    <ExpandCollapseIcon className="text(gray-600 xxs)" />
                  </div>
                </Accordion.Button>
              </Accordion.Header>
              <Accordion.Panel
                className={tw(
                  css({
                    '&[data-state="open"]': slideDownAnimation,
                    '&[data-state="closed"]': slideUpAnimation,
                  })
                )}
              >
                <ul className="p-4">
                  {value.allocations.map((allocation) => {
                    if (value.allocations.length === 1) {
                      return (
                        <p className="font-medium text(xxs gray-300)">
                          All in {allocation.walletName}.
                        </p>
                      );
                    }
                    return (
                      <li
                        key={allocation.walletName}
                        className="flex items-center justify-between font-medium text(xxs gray-300)"
                      >
                        <p className="flex-1">{allocation.walletName}</p>
                        <p className="flex-1">
                          {(
                            (allocation.coinQuantity / value.total) *
                            100
                          ).toFixed(2)}
                          %
                        </p>
                        <p className="flex-1">
                          {toNum(allocation.coinQuantity)} {value.coinSymbol}
                        </p>
                        <p className="flex-1">
                          {toUsd(allocation.coinQuantity * usd)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion.Root>
    </Layout>
  );
};

export default App;

export async function getServerSideProps(context) {
  if (!context.query.id) return null;
  const { key, id } = context.query;
  const airtableRecords = await fetchAirtableData(key, id);

  return {
    props: { airtableRecords },
  };
}
