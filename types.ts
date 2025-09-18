import { ELIV_PACKAGES, ELIV_PAYMENT_OPTIONS } from "./constants";

export type ElivPackageKey = keyof typeof ELIV_PACKAGES;
export type ElivPaymentKey = keyof typeof ELIV_PAYMENT_OPTIONS;
