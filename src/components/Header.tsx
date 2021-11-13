import { useRef, useEffect } from "react";
import { toUsd } from "utils";

export type HeaderProps = {
  total: number;
};

function getTotalColor(previousTotal, currentTotal) {
  if (previousTotal > currentTotal) {
    return "text-red-500";
  } else if (previousTotal < currentTotal) {
    return "text-green-500";
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

  const color = getTotalColor(previousTotal.current, total);

  return (
    <header className="p-4 text-center sticky top-0 shadow-md flex items-center justify-between backdrop-filter backdrop-blur-md w-full">
      <img src="/coinster-icon.svg" className="h-12 w-12" alt="Coinster" />
      <h1
        className={`${color} text-4xl  md:text-4xl font-bold transition-colors duration-200`}>
        {toUsd(total)}
      </h1>
    </header>
  );
};
