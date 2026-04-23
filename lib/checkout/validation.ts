export type CheckoutFieldName =
  | "customerName"
  | "customerEmail"
  | "shippingStreet"
  | "shippingNumber"
  | "shippingCity"
  | "shippingProvince"
  | "shippingPostalCode"
  | "items"
  | "paymentToken"
  | "paymentMethodId"
  | "payerEmail"
  | "payerIdType"
  | "payerIdNumber";

export type CheckoutFieldErrors = Partial<Record<CheckoutFieldName, string>>;

export type ParsedCheckoutItem = {
  productId: string;
  quantity: number;
};

export function readTrimmedString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export function parseItems(formData: FormData): ParsedCheckoutItem[] {
  const productIds = formData.getAll("itemProductId");
  const quantities = formData.getAll("itemQuantity");
  const items: ParsedCheckoutItem[] = [];

  for (let index = 0; index < productIds.length; index += 1) {
    const rawProductId = productIds[index];
    const rawQuantity = quantities[index];
    const productId = typeof rawProductId === "string" ? rawProductId.trim() : "";
    const quantityValue = typeof rawQuantity === "string" ? Number(rawQuantity) : Number.NaN;

    if (!productId) {
      continue;
    }

    items.push({
      productId,
      quantity: Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 0,
    });
  }

  return items;
}

function isAutoPaymentStrategy(formData: FormData): boolean {
  return readTrimmedString(formData, "paymentStrategy") === "auto";
}

export function buildFieldErrors(formData: FormData): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};
  const items = parseItems(formData);

  if (!readTrimmedString(formData, "customerName")) {
    errors.customerName = "Ingresá el nombre del cliente.";
  }

  if (!readTrimmedString(formData, "customerEmail")) {
    errors.customerEmail = "Ingresá un email válido para el pedido.";
  }

  if (!readTrimmedString(formData, "shippingStreet")) {
    errors.shippingStreet = "Ingresá la calle de entrega.";
  }

  if (!readTrimmedString(formData, "shippingNumber")) {
    errors.shippingNumber = "Ingresá la numeración.";
  }

  if (!readTrimmedString(formData, "shippingCity")) {
    errors.shippingCity = "Ingresá la ciudad.";
  }

  if (!readTrimmedString(formData, "shippingProvince")) {
    errors.shippingProvince = "Ingresá la provincia.";
  }

  if (!readTrimmedString(formData, "shippingPostalCode")) {
    errors.shippingPostalCode = "Ingresá el código postal.";
  }

  if (items.length === 0 || items.some((item) => item.quantity <= 0)) {
    errors.items = "Necesitás al menos un producto con cantidad mayor a cero.";
  }

  if (isAutoPaymentStrategy(formData)) {
    if (!readTrimmedString(formData, "paymentToken")) {
      errors.paymentToken = "Falta el token de pago. En producción lo genera el Payment Brick.";
    }

    if (!readTrimmedString(formData, "paymentMethodId")) {
      errors.paymentMethodId = "Seleccioná el método de pago.";
    }

    if (!readTrimmedString(formData, "payerEmail")) {
      errors.payerEmail = "Ingresá el email del pagador.";
    }

    if (!readTrimmedString(formData, "payerIdType")) {
      errors.payerIdType = "Seleccioná el tipo de documento (DNI o CUIT).";
    }

    if (!readTrimmedString(formData, "payerIdNumber")) {
      errors.payerIdNumber = "Ingresá el número de documento del pagador.";
    }
  }

  return errors;
}

export function hasFieldErrors(fieldErrors: CheckoutFieldErrors): boolean {
  return Object.keys(fieldErrors).length > 0;
}
