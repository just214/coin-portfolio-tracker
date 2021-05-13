import { Header } from "../components/Header";
import { PushSpinner } from "react-spinners-kit";
import { useEffect, useState } from "react";
import { CoinGeckoData, CoinData } from "../types";
import { groupBy } from "lodash";
import { toNum, toUsd, fetchAirtableData, fetchCoinGeckoData } from "../utils";
import { Layout } from "../components/Layout";
import {
  FaCaretUp,
  FaCaretDown,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
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
  const { airtableRecords, coingeckoData: initialCoinData } = props;
  const [coingeckoData, setCoingeckoData] =
    useState<CoinGeckoData>(initialCoinData);
  const [data, setData] = useState<CoinData[]>([]);
  const [totalValueInUsd, setTotalValueInUsd] = useState<number>(null);
  const [expandedCoinIds, setExpandedCoinIds] = useState([]);

  // Fetch the CoinGecko coin info for each coin in Airtable...on an interval every second
  useEffect(() => {
    if (!airtableRecords) return;

    const interval = setInterval(async () => {
      const data = await fetchCoinGeckoData(airtableRecords);
      setCoingeckoData(data);
    }, 1000);
    fetchCoinGeckoData(airtableRecords);

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
        <PushSpinner size={80} color="gray" />
      </div>
    );

  return (
    <Layout>
      <Header total={totalValueInUsd} />

      <Accordion.Root type="multiple" onValueChange={setExpandedCoinIds}>
        {data.map((value) => {
          const isExpanded = expandedCoinIds.includes(value.coinId);
          const ExpandCollapseIcon = isExpanded
            ? FaChevronDown
            : FaChevronRight;
          if (!coingeckoData[value.coinId]) return;
          const { usd, usd_24h_change } = coingeckoData[value.coinId];

          return (
            <Accordion.Item
              value={value.coinId}
              className={`duration-200 my-3 py-0 ${
                isExpanded ? "shadow-lg rounded-xl" : ""
              }`}
              key={value.coinId}
            >
              <Accordion.Header>
                <Accordion.Button
                  className={`w-full ring-0! outline-none! px-2 pb-2 font-medium border(b gray-200 dark:gray-700) ${
                    isExpanded ? "" : "focus-visible:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm px-2">
                    <div className="text-left flex-1">
                      <p className="text-base">{value.coinName}</p>
                      <p className="text-sm text-gray-400">
                        {value.coinSymbol}
                      </p>
                    </div>
                    <div className="text-right flex-1 mx-2">
                      <p className="text-sm">{toUsd(usd)}</p>

                      <span
                        className={`text-sm justify-end flex items-center px-1 ${
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
                    <div className="children:text-right flex-1 mx-2">
                      <p className="font-bold text-base">
                        {toUsd(value.total * usd)}
                      </p>
                      <p className="text-xs">
                        {toNum(value.total)} {value.coinSymbol}
                      </p>
                    </div>
                    <ExpandCollapseIcon className="text(gray-300 dark:gray-600 xxs)" />
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
                <ul
                  className={`my-4 mx-3 ${
                    value.allocations.length === 1 ? "" : "border-transblack"
                  }`}
                >
                  {value.allocations.map((allocation) => {
                    if (value.allocations.length === 1) {
                      return (
                        <p
                          className="font-medium text(xxs)"
                          key={allocation.walletName}
                        >
                          All in {allocation.walletName}.
                        </p>
                      );
                    }
                    return (
                      <li
                        key={allocation.walletName}
                        className="flex items-center justify-between font-medium text(xxs) odd:bg-transblack p-1"
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
                          {toNum(allocation.coinQuantity)}c
                        </p>
                        <p className="flex-1">
                          {toUsd(allocation.coinQuantity * usd)}
                        </p>
                      </li>
                    );
                  })}
                </ul>

                <div className="px-4 py-2">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm focus:underline hover:underline"
                    href={`https://www.coingecko.com/en/coins/${value.coinId}`}
                  >
                    View on CoinGecko
                  </a>
                </div>
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
  if (!context.query.id)
    return {
      props: {},
    };
  const { key, id } = context.query;
  const airtableRecords = await fetchAirtableData(key, id);
  const coingeckoData = await fetchCoinGeckoData(airtableRecords);

  return {
    props: { airtableRecords, coingeckoData },
  };
}
