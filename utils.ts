import { AirTableRecord, CoinGeckoData } from "./types";
import numbro from "numbro";

export function toUsd(num: number) {
  const options = {
    style: "currency",
    currency: "USD",
    minimumSignificantDigits: num > 1 ? undefined : 2,
  };
  return new Intl.NumberFormat("en-US", options).format(num);
  // .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
}

export function toNum(num: number) {
  return numbro(num).format({
    thousandSeparated: true,
    average: true,
    totalLength: 6,
  });
}

export async function fetchAirtableData(
  key: string | string[],
  id: string | string[]
) {
  try {
    const ENDPOINT = `https://api.airtable.com/v0/${id}/Allocations?&view=Coin%20View`;
    const response = await fetch(ENDPOINT, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });
    const { records } = await response.json();
    return (records as AirTableRecord[]).filter((record) => {
      return record.fields.IgnoreCoin[0] === null;
    });
  } catch (error) {
    console.error("AIRTABLE ERROR", error);
    return error;
  }
}

// FETCH
export async function fetchCoinGeckoData(airtableRecords: AirTableRecord[]) {
  try {
    const coinIds = [
      // @ts-ignore
      ...new Set(airtableRecords.map((value) => value.fields.CoinID[0])),
    ].join(",");

    const coingecko_endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(coingecko_endpoint, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });
    const values = await res.json();
    return values as CoinGeckoData;
  } catch (error) {
    console.error("COINGECKO ERROR", error);
    return error;
  }
}
