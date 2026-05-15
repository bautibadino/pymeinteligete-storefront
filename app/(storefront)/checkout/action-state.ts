import type { ManualPaymentSuccessSource } from "@/lib/checkout/manual-payment";
import type { StorefrontCartValidateResult } from "@/lib/storefront-api";

export type CheckoutActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  cartValidation?: StorefrontCartValidateResult;
  fieldErrors?: Partial<Record<import("@/lib/checkout/validation").CheckoutFieldName, string>>;
  orderId?: string;
  orderToken?: string;
  orderNumber?: string;
  total?: number;
  payerEmail?: string;
};

export type ManualPaymentActionState = {
  status: "idle" | "success" | "error";
  message?: string;
} & Partial<ManualPaymentSuccessSource>;

export const initialCheckoutActionState: CheckoutActionState = {
  status: "idle",
};

export const initialManualPaymentActionState: ManualPaymentActionState = {
  status: "idle",
};
