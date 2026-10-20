export type Token = {
  symbol: string;
  price: number;
  updatedAt: string;
};

export type Receipt = {
  pay: number;
  receive: number;
  from: string;
  to: string;
  rate: number;
  value: number;
};
