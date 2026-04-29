import type {
  StorefrontManualPaymentBankAccount,
  StorefrontManualPaymentContactInfo,
} from "@/lib/storefront-api";

export type ManualPaymentSuccessSource = {
  paymentAttemptId: string;
  orderId: string;
  orderToken: string;
  amount: number;
  methodDisplayName: string;
  instructions?: string;
  bankAccounts?: StorefrontManualPaymentBankAccount[];
  contactInfo?: StorefrontManualPaymentContactInfo;
};

export type ManualPaymentContactItem = {
  label: "Email" | "Teléfono" | "WhatsApp";
  value: string;
};

export type ManualPaymentSuccessDetails = {
  paymentAttemptId: string;
  orderId: string;
  orderToken: string;
  amount: number;
  methodDisplayName: string;
  instructions?: string;
  bankAccounts: StorefrontManualPaymentBankAccount[];
  contactItems: ManualPaymentContactItem[];
};

function pushContactItem(
  items: ManualPaymentContactItem[],
  label: ManualPaymentContactItem["label"],
  value: string | undefined,
) {
  if (!value) {
    return;
  }

  items.push({ label, value });
}

export function buildManualPaymentSuccessDetails(
  source: ManualPaymentSuccessSource,
): ManualPaymentSuccessDetails {
  const contactItems: ManualPaymentContactItem[] = [];

  pushContactItem(contactItems, "Email", source.contactInfo?.email);
  pushContactItem(contactItems, "Teléfono", source.contactInfo?.phone);
  pushContactItem(contactItems, "WhatsApp", source.contactInfo?.whatsapp);

  return {
    paymentAttemptId: source.paymentAttemptId,
    orderId: source.orderId,
    orderToken: source.orderToken,
    amount: source.amount,
    methodDisplayName: source.methodDisplayName,
    ...(source.instructions ? { instructions: source.instructions } : {}),
    bankAccounts: source.bankAccounts ?? [],
    contactItems,
  };
}
