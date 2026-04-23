/**
 * Hook para manejar claves de idempotencia
 * Previene duplicados en operaciones de creación
 *
 * @example
 * const { idempotencyKey, resetKey } = useIdempotency()
 *
 * // Al enviar formulario:
 * await createOrder({ ...data, idempotencyKey })
 *
 * // Después de éxito:
 * resetKey() // Genera una nueva key para la próxima operación
 */

import { useState, useCallback, useRef } from "react"

/**
 * Genera un UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface UseIdempotencyReturn {
  /** Clave única actual para esta operación */
  idempotencyKey: string
  /** Genera una nueva clave (útil después de éxito o para reiniciar) */
  resetKey: () => void
  /** Indica si hay una operación en curso (protección contra doble submit) */
  isSubmitting: boolean
  /** Inicia el estado de submit (llamar al inicio del submit) */
  startSubmit: () => void
  /** Finaliza el estado de submit (llamar en finally) */
  endSubmit: () => void
  /** Callback seguro para submit con protección integrada */
  submitSafely: <T>(submitFn: () => Promise<T>) => Promise<T>
}

/**
 * Hook para manejar idempotencia en operaciones de creación
 *
 * Características:
 * - Genera UUID v4 automáticamente al montar
 * - Protege contra doble submit (clicks rápidos)
 * - Permite reiniciar la clave después de éxito
 * - TTL de 1 hora en el backend para las claves
 */
export function useIdempotency(): UseIdempotencyReturn {
  // Usar useRef para persistir la key entre renders sin causar re-render innecesario
  const keyRef = useRef<string>(generateUUID())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetKey = useCallback(() => {
    keyRef.current = generateUUID()
  }, [])

  const startSubmit = useCallback(() => {
    setIsSubmitting(true)
  }, [])

  const endSubmit = useCallback(() => {
    setIsSubmitting(false)
  }, [])

  /**
   * Ejecuta una función de submit con protección contra duplicados
   * - Bloquea submits concurrentes
   * - Mantiene la misma idempotencyKey durante toda la operación
   * - No resetea la key automáticamente (debes llamar resetKey() manualmente después del éxito)
   */
  const submitSafely = useCallback(
    async <T,>(submitFn: () => Promise<T>): Promise<T> => {
      if (isSubmitting) {
        throw new Error("Ya hay una operación en curso")
      }

      startSubmit()
      try {
        const result = await submitFn()
        return result
      } finally {
        endSubmit()
      }
    },
    [isSubmitting, startSubmit, endSubmit],
  )

  return {
    idempotencyKey: keyRef.current,
    resetKey,
    isSubmitting,
    startSubmit,
    endSubmit,
    submitSafely,
  }
}

export default useIdempotency
