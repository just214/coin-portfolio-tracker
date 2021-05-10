import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import useDebounce from "../hooks/useDebounce";

export default function Home(props) {
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce<string>(input, 500);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(() =>
      !input.length
        ? []
        : props.data.filter((d) =>
            d.name.toLowerCase().includes(debouncedInput.toLowerCase())
          )
    );
  }, [debouncedInput]);

  return (
    <Layout>
      <div className="px-4 py-12">
        <label className="pl-2">
          Find a CoinGecko Coin Id
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="search"
            className="bg-black text-white rounded-full w-full py-2 px-4 my-1 outline-none"
          />
        </label>
        <ul>
          {data.map(({ name, symbol, id }) => {
            return (
              <li key={id} className="border-b border-gray-700 py-1">
                <p>
                  <span>Name:</span> <span>{name}</span>
                </p>
                <p>
                  <span>Symbol:</span> <span>{symbol}</span>{" "}
                </p>
                <p>
                  <span>The ID is</span> <b className="text-yellow-500">{id}</b>
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
}

export async function getStaticProps(context) {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/list?include_platform=false",
    { method: "GET", headers: { accept: "application/json" } }
  );
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}
