export function toUsd(num: number) {
  const options = { style: "currency", currency: "USD" };
  return new Intl.NumberFormat("en-US", options).format(num);
}

export function toNum(num: number) {
  return (
    num
      .toFixed(8)
      // https://exceptionshub.com/remove-insignificant-trailing-zeros-from-a-number.html
      .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1")
      .toLocaleString()
  );
}
