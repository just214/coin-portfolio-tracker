import * as React from "react";
import { toNum } from "../utils";

export type AllocationLineItemProps = {
  walletName: string;
  percentageAllocated: string;
  coinQuantity: number;
  coinSymbol: string;
  valueInUsd: string;
};

export const AllocationLineItem = (props: AllocationLineItemProps) => {
  return (
    <li
      key={props.walletName}
      className="flex items-center justify-between font-medium text-[11px] even:bg-transblack p-1"
    >
      <p className="flex-1 ml-2">{props.walletName}</p>
      <p className="flex-1">{props.percentageAllocated}%</p>
      <p className="flex-1">
        {toNum(props.coinQuantity)} {props.coinSymbol}
      </p>
      <p className="flex-1">{props.valueInUsd}</p>
    </li>
  );
};
