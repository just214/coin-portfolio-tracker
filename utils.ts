import { AirTableRecord } from "./types";

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
      .toFixed(4)
      // https://exceptionshub.com/remove-insignificant-trailing-zeros-from-a-number.html
      .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1")
      .toLocaleString()
  );
}

export async function fetchAirtableData(
  key: string | string[],
  id: string | string[]
) {
  try {
    const ENDPOINT = `https://api.airtable.com/v0/${id}/Allocations?&view=Grid%20view`;
    const response = await fetch(ENDPOINT, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });
    const { records } = await response.json();
    return records as AirTableRecord[];
  } catch (error) {
    console.error("AIRTABLE ERROR", error);
    return error;
  }
}
