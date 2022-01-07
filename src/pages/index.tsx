import { Header } from "components/Header";
import { PushSpinner } from "react-spinners-kit";
import { useEffect, useState } from "react";
import { CoinGeckoData, CoinData } from "types";
import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { AllocationLineItem } from "components/AllocationLineItem";
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
  const router = useRouter();
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

  if (!router.query?.key || !router.query?.id) {
    return <h1 className="p-8 text-red-600">Please provide a key and id.</h1>;
  }

  if (!data.length)
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <PushSpinner size={80} color="orange" />
        </div>
      </Layout>
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
              className={`duration-200 m-3 py-0 dark:bg-gray-800 bg-white overflow-hidden rounded-lg `}
              key={value.coinId}
            >
              <Accordion.Header>
                <Accordion.Trigger
                  className={`w-full ring-0! outline-none! p-2 font-medium appearance-none`}
                >
                  <div>
                    <div className="flex items-center justify-between text-sm px-2">
                      <div className="text-left flex-1">
                        <p className="text-base">
                          {value.coinName}{" "}
                          <span className="text-xs text-orange-500">
                            {(
                              ((value.total * usd) / totalValueInUsd) *
                              100
                            ).toFixed(2)}
                            %
                          </span>
                        </p>
                        <p className="text-sm text-gray-400">
                          {value.coinSymbol}
                        </p>
                      </div>
                      <div className="text-right flex-1 mx-2">
                        <p className="text-sm">
                          <b>{toUsd(usd)}</b>
                        </p>

                        <span
                          className={`text-xs justify-end flex items-center px-1`}
                        >
                          {usd_24h_change > 0 ? (
                            <FaCaretUp className="text-green-500 text-base" />
                          ) : (
                            <FaCaretDown className="text-red-500 text-base" />
                          )}
                          {Math.abs(usd_24h_change).toFixed(2)}%
                        </span>
                      </div>
                      <ExpandCollapseIcon />
                    </div>

                    <p className="rounded bg-black/10 dark:bg-[rgba(0,0,0,.2)] px-2text-sm text-left px-2 py-2 mt-1">
                      You have {toNum(value.total)} {value.coinSymbol} worth{" "}
                      <b>{toUsd(value.total * usd)}</b>.
                    </p>
                  </div>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <ul>
                  {value.allocations.map((allocation) => {
                    return (
                      <AllocationLineItem
                        walletName={allocation.walletName}
                        key={allocation.walletName}
                        coinQuantity={allocation.coinQuantity}
                        coinSymbol={value.coinSymbol}
                        percentageAllocated={(
                          (allocation.coinQuantity / value.total) *
                          100
                        ).toFixed(2)}
                        valueInUsd={toUsd(allocation.coinQuantity * usd)}
                      />
                    );
                  })}
                </ul>

                <div className="px-4 py-2">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 block text-sm text-center focus:underline hover:underline"
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

      <footer className="pt-4 text-center">
        <span role="emoji" aria-label="Diamond Hands" className="text-3xl">
          💎 🙌
        </span>
      </footer>
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
