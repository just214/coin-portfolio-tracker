import { Header } from "../components/Header";
import { PushSpinner } from "react-spinners-kit";
import { useEffect, useState } from "react";
import { CoinGeckoData, CoinData } from "../types";
import { InferGetServerSidePropsType } from "next";
import {
  toNum,
  toUsd,
  fetchAirtableData,
  fetchCoinGeckoData,
  getValuesByCoin,
  getTotalValueInUsd,
} from "../utils";
import { Layout } from "../components/Layout";
import {
  FaCaretUp,
  FaCaretDown,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import * as Accordion from "@radix-ui/react-accordion";

const App = (props: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { airtableRecords, coinGeckoData: initialCoinData } = props;
  const [coinGeckoData, setCoingeckoData] =
    useState<CoinGeckoData>(initialCoinData);
  const [data, setData] = useState<CoinData[]>([]);
  const [totalValueInUsd, setTotalValueInUsd] = useState<number>(null);
  const [expandedCoinIds, setExpandedCoinIds] = useState([]);

  // Fetch the CoinGecko coin info for each coin in Airtable...on an interval every second
  useEffect(() => {
    if (!airtableRecords) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchCoinGeckoData(airtableRecords);
        setCoingeckoData(data);
      } catch (error) {
        console.error("COINGECKO ERROR", error);
      }
    }, 2000);
    fetchCoinGeckoData(airtableRecords);

    return () => {
      clearInterval(interval);
    };
  }, [airtableRecords]);

  // Step 3. Massage the Airtable and Coin Gecko data into the final data objects and save as state for rendering
  useEffect(() => {
    if (!coinGeckoData) return;

    const values = getValuesByCoin(airtableRecords, coinGeckoData);
    setTotalValueInUsd(getTotalValueInUsd(values, coinGeckoData));
    setData(values);
  }, [coinGeckoData]);

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
          if (!coinGeckoData[value.coinId]) return;
          const { usd, usd_24h_change } = coinGeckoData[value.coinId];

          return (
            <Accordion.Item
              value={value.coinId}
              className={`duration-200 my-3 py-0 border-2 ${
                isExpanded
                  ? "shadow-lg rounded-xl border-gray-200"
                  : "border-transparent"
              }`}
              key={value.coinId}
            >
              <Accordion.Header>
                <Accordion.Trigger
                  className={`w-full ring-0! outline-none! px-2 pb-2 font-medium rounded-xl ${
                    isExpanded
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "focus-visible:shadow-md"
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
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <ul
                  className={`my-4 mx-3 ${
                    value.allocations.length === 1 ? "" : "border-transblack"
                  }`}
                >
                  {value.allocations.map((allocation) => {
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
                          {toNum(allocation.coinQuantity)} {value.coinSymbol}
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
              </Accordion.Content>
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
      props: { error: true },
    };
  const { key, id } = context.query;
  const airtableRecords = await fetchAirtableData(key, id);
  const coinGeckoData = await fetchCoinGeckoData(airtableRecords);
  return {
    props: { airtableRecords, coinGeckoData },
  };
}
