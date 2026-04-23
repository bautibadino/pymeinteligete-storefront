/**
 * Loader y utilidades para el SDK de MercadoPago JS
 * Usado para Checkout Bricks (Payment Brick)
 */

// Tipo para el constructor de MercadoPago SDK
type MercadoPagoConstructor = new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance

declare global {
  interface Window {
    MercadoPago: MercadoPagoConstructor
  }
}

export interface MercadoPagoInstance {
  bricks: () => BricksBuilder
}

export interface BricksBuilder {
  create: (
    brick: "payment",
    containerId: string,
    settings: PaymentBrickSettings
  ) => Promise<BrickController>
}

export interface BrickController {
  unmount: () => void
  getFormData: () => Promise<PaymentFormData>
}

export interface PaymentBrickSettings {
  initialization: {
    amount: number
    preferenceId?: string
    payer?: {
      email?: string
    }
  }
  customization?: {
    visual?: {
      style?: {
        theme?: "default" | "dark" | "bootstrap" | "flat"
        customVariables?: Record<string, string>
      }
      hideFormTitle?: boolean
      hidePaymentButton?: boolean
    }
    paymentMethods?: {
      creditCard?: "all" | string[]
      debitCard?: "all" | string[]
      ticket?: "all" | string[]
      maxInstallments?: number
    }
  }
  callbacks: {
    onReady?: () => void
    onSubmit: (formData: PaymentFormData) => Promise<void>
    onError?: (error: BrickError) => void
  }
}

export interface PaymentFormData {
  selectedPaymentMethod: string
  formData: {
    token?: string
    issuer_id?: string
    payment_method_id: string
    transaction_amount: number
    installments?: number
    payer: {
      email: string
      identification?: {
        type: string
        number: string
      }
    }
  }
}

export interface BrickError {
  type: string
  message: string
  cause?: string
}

// SDK Script loader — keyed by publicKey for multi-tenant support
const sdkCache = new Map<string, Promise<MercadoPagoInstance>>()
let scriptLoaded = false

/**
 * Carga el SDK de MercadoPago de forma asíncrona.
 * Cacheado por publicKey para soportar multi-tenant.
 * @param publicKey - Public key de MercadoPago per-empresa
 */
export function loadMercadoPagoSDK(publicKey: string): Promise<MercadoPagoInstance> {
  if (!publicKey) {
    return Promise.reject(new Error("Se requiere una publicKey de MercadoPago"))
  }

  const cached = sdkCache.get(publicKey)
  if (cached) return cached

  const promise = new Promise<MercadoPagoInstance>((resolve, reject) => {
    const initMP = () => {
      if (window.MercadoPago) {
        resolve(new window.MercadoPago(publicKey, { locale: "es-AR" }))
      } else {
        reject(new Error("MercadoPago SDK no se cargó correctamente"))
      }
    }

    if (scriptLoaded || window.MercadoPago) {
      initMP()
      return
    }

    const script = document.createElement("script")
    script.src = "https://sdk.mercadopago.com/js/v2"
    script.async = true

    script.onload = () => {
      scriptLoaded = true
      initMP()
    }

    script.onerror = () => {
      sdkCache.delete(publicKey)
      reject(new Error("Error al cargar el SDK de MercadoPago"))
    }

    document.head.appendChild(script)
  })

  sdkCache.set(publicKey, promise)
  return promise
}

/**
 * Limpia el SDK cacheado (útil para testing o reinicio)
 */
export function resetMercadoPagoSDK(): void {
  sdkCache.clear()
  scriptLoaded = false
}
