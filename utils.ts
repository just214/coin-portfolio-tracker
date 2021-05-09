export function toUsd(num: number, cap?: boolean) {
  const options = {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: cap ? undefined : 8,
  };
  return new Intl.NumberFormat("en-US", options).format(num);
}

export function toNum(num: number) {
  return (
    num
      .toFixed(6)
      // https://exceptionshub.com/remove-insignificant-trailing-zeros-from-a-number.html
      .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1")
      .toLocaleString()
  );
}
