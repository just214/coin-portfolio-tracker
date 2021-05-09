export type AirTableTransactionRecord = {
  createdTime: string;
  id: string;
  fields: {
    Coin: string[];
    CoinID: string[];
    CoinName: string[];
    CoinSymbol: string[];
    ID: number;
    Quantity: number;
    Wallet: string[];
    WalletName: string[];
  };
};

export type CoinGeckoCoin = {
  usd: number;
  usd_24h_change: number;
};

export type CoinGeckoData = {
  [key: string]: CoinGeckoCoin;
};

export type CoinData = {
  coinName: string;
  coinSymbol: string;
  coinId: string;
  total: number;
  transactions: { wallet: string; quantity: number }[];
};

type Transaction = {
  wallet: string;
  quantity: number;
};

export type FinalReturnValue = {
  coinName: string;
  coinSymbol: string;
  coinId: string;
  total: number;
  transactions: Transaction[];
};
