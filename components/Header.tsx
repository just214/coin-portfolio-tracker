import { useRef, useEffect } from "react";
import { toUsd } from "../utils";

export type HeaderProps = {
  total: number;
};

function getTotalColor(previousTotal, currentTotal) {
  if (previousTotal > currentTotal) {
    return "text-red-400";
  } else if (previousTotal < currentTotal) {
    return "text-green-400";
  }
}

export const Header = (props: HeaderProps) => {
  const { total } = props;
  const previousTotal = useRef<number>(total);

  useEffect(() => {
    setTimeout(() => {
      previousTotal.current = total;
    }, 500);
  }, [total]);

  return (
    <header className="py-1 px-4 text-center my-2 sticky top-0 shadow-md applydark flex items-center justify-between">
      <img src="/coinster-icon.svg" className="h-12 w-12" alt="Coinster" />
      <h1
        className={`${getTotalColor(
          previousTotal.current,
          total
        )} text(3xl md:4xl) font-bold transition-colors duration-500`}
      >
        {toUsd(total)}
      </h1>
    </header>
  );
};
