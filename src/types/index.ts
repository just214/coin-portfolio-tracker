export type AirTableRecord = {
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

export type AirTableRecords = AirTableRecord[];

export type CoinGeckoCoin = {
  usd: number;
  usd_24h_change: number;
};

export type CoinGeckoData = {
  [key: string]: CoinGeckoCoin;
};

type Allocation = {
  walletName: string;
  coinQuantity: number;
};

export type CoinData = {
  coinName: string;
  coinSymbol: string;
  coinId: string;
  total: number;
  allocations: Allocation[];
};
