"use client";

import { useEffect, useRef, useState } from "react";

import { useIdempotency } from "@/hooks/use-idempotency";
import { loadMercadoPagoSDK, resetMercadoPagoSDK, type PaymentFormData } from "@/lib/mercadopago/sdk";

export type PaymentBrickStatus = "loading" | "ready" | "error" | "processing";

interface PaymentBrickProps {
  /** Public key de MercadoPago para este tenant */
  publicKey: string;
  /** Monto total a cobrar (con IVA incluido) */
  amount: number;
  /** ID de la orden interna */
  orderId: string;
  /** Token de la orden para redirección */
  orderToken: string;
  /** Email del cliente (prefilled) */
  payerEmail: string;
  /** Callback cuando el pago se procesa exitosamente */
  onPaymentSuccess: (paymentData: PaymentFormData) => void;
  /** Callback cuando hay un error en el pago */
  onPaymentError: (error: string) => void;
  /** Callback cuando el brick está listo */
  onReady?: () => void;
}

export function PaymentBrick({
  publicKey,
  amount,
  orderId,
  orderToken,
  payerEmail,
  onPaymentSuccess,
  onPaymentError,
  onReady,
}: PaymentBrickProps) {
  const [status, setStatus] = useState<PaymentBrickStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const brickMountedRef = useRef(false);
  const brickControllerRef = useRef<unknown>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { idempotencyKey, resetKey, submitSafely, isSubmitting: isIdempotencySubmitting } = useIdempotency();

  // Refs estables para callbacks
  const callbacksRef = useRef({ onPaymentSuccess, onPaymentError, onReady, orderId, orderToken });
  callbacksRef.current = { onPaymentSuccess, onPaymentError, onReady, orderId, orderToken };
  const idempotencyRef = useRef({ idempotencyKey, resetKey, submitSafely, isSubmitting: isIdempotencySubmitting });
  idempotencyRef.current = { idempotencyKey, resetKey, submitSafely, isSubmitting: isIdempotencySubmitting };

  useEffect(() => {
    if (brickMountedRef.current) return;
    brickMountedRef.current = true;

    async function initBrick() {
      try {
        // Validar public key
        if (!publicKey) {
          throw new Error("Pagos no disponibles para esta tienda. Contactá al vendedor.");
        }

        // Validar amount
        if (!amount || amount <= 0 || !Number.isFinite(amount)) {
          throw new Error(`Monto inválido: ${amount}`);
        }

        // Cargar SDK (cacheado por publicKey)
        const mp = await loadMercadoPagoSDK(publicKey);
        const bricks = mp.bricks();

        const onSubmitCallback = async (formData: PaymentFormData) => {
          if (idempotencyRef.current.isSubmitting) {
            return;
          }

          setStatus("processing");

          try {
            await idempotencyRef.current.submitSafely(async () => {
              // Importar dinámicamente para evitar problemas de bundle en server
              const { processPaymentAction } = await import("@/app/(storefront)/checkout/actions");
              const paymentFormData = new FormData();
              paymentFormData.set("orderId", callbacksRef.current.orderId);
              paymentFormData.set("orderToken", callbacksRef.current.orderToken);
              paymentFormData.set("transactionAmount", String(formData.formData.transaction_amount));
              if (formData.formData.token) {
                paymentFormData.set("paymentToken", formData.formData.token);
              }
              paymentFormData.set("paymentMethodId", formData.formData.payment_method_id);
              paymentFormData.set("installments", String(formData.formData.installments ?? 1));
              if (formData.formData.issuer_id) {
                paymentFormData.set("issuerId", formData.formData.issuer_id);
              }
              paymentFormData.set("payerEmail", formData.formData.payer.email);
              if (formData.formData.payer.identification) {
                paymentFormData.set("payerIdType", formData.formData.payer.identification.type);
                paymentFormData.set("payerIdNumber", formData.formData.payer.identification.number);
              }

              const result = await processPaymentAction({ status: "idle" }, paymentFormData);

              if (result.status === "error") {
                if (result.message?.includes("cc_rejected_duplicated_payment")) {
                  idempotencyRef.current.resetKey();
                  setError("Detectamos un intento previo. Esperá unos segundos y volvé a intentar.");
                } else {
                  setError(result.message || "Error al procesar el pago");
                }
                setStatus("ready");
                callbacksRef.current.onPaymentError(result.message || "Error al procesar el pago");
                return;
              }

              idempotencyRef.current.resetKey();
              callbacksRef.current.onPaymentSuccess(formData);
            });
          } catch (err) {
            if (err instanceof Error && err.message === "Ya hay una operación en curso") {
              return;
            }
            setError("Error de conexión. Intentá nuevamente.");
            setStatus("ready");
            callbacksRef.current.onPaymentError("Error de conexión");
          }
        };

        const controller = await bricks.create("payment", "paymentBrick_container", {
          initialization: {
            amount: Number(amount),
            payer: {
              email: payerEmail,
            },
          },
          customization: {
            visual: {
              hideFormTitle: true,
            },
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              ticket: "all",
              maxInstallments: 12,
            },
          },
          callbacks: {
            onReady: () => {
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
              }
              setStatus("ready");
              callbacksRef.current.onReady?.();
            },
            onSubmit: onSubmitCallback,
            onError: (err: unknown) => {
              const errorObj = err as { type?: string; cause?: string; message?: string };
              if (errorObj.type === "critical" || errorObj.cause === "payment_brick_initialization_failed") {
                setError(errorObj.message || "Error al inicializar el método de pago. Por favor, recargá la página.");
                setStatus("error");
                callbacksRef.current.onPaymentError(errorObj.message || "Error de inicialización");
              }
            },
          },
        });

        brickControllerRef.current = controller;

        // Timeout de seguridad
        timeoutRef.current = setTimeout(() => {
          setStatus((current) => {
            if (current === "loading") {
              setError("El formulario de pago tardó demasiado en cargar. Recargá la página para intentar de nuevo.");
              return "error";
            }
            return current;
          });
        }, 15000);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        setStatus("error");
      }
    }

    initBrick();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (brickControllerRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (brickControllerRef.current as any).unmount?.();
        } catch {
          // ignorar errores de unmount
        }
      }
      resetMercadoPagoSDK();
      brickMountedRef.current = false;
    };
  }, [amount, payerEmail]);

  return (
    <div className="payment-brick-wrapper">
      {error && (
        <div className="checkout-error-banner" role="alert">
          {error}
        </div>
      )}

      {status === "loading" && (
        <div className="payment-brick-loading">
          <span className="payment-brick-spinner" />
          <span>Cargando medios de pago...</span>
        </div>
      )}

      {status === "processing" && (
        <div className="payment-brick-processing">
          <span className="payment-brick-spinner" />
          <span>Procesando pago...</span>
        </div>
      )}

      <div
        id="paymentBrick_container"
        style={{ display: status === "loading" ? "none" : "block" }}
      />

      <p className="payment-brick-footer">
        Pago procesado de forma segura por MercadoPago
      </p>
    </div>
  );
}

export default PaymentBrick;
