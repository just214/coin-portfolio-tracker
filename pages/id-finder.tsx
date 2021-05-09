import { useEffect, useState } from "react";
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
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        type="text"
      />
      {data.map(({ name, symbol, id }) => {
        return (
          <div key={id}>
            <p>Name: {name}</p>
            <p>Symbol: {symbol}</p>
            <p>ID: {id}</p>
            <hr />
          </div>
        );
      })}
    </div>
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
