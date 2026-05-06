import { describe, expect, it, vi } from "vitest";

import { createRandomId } from "@/lib/utils/random-id";

describe("createRandomId", () => {
  it("usa crypto.randomUUID cuando esta disponible", () => {
    const randomUUID = vi.fn(() => "uuid-123");

    const result = createRandomId({
      crypto: {
        randomUUID,
      },
    });

    expect(result).toBe("uuid-123");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it("genera un UUID v4 con getRandomValues cuando randomUUID no existe", () => {
    const result = createRandomId({
      crypto: {
        getRandomValues: (array) => {
          array.fill(0);
          return array;
        },
      },
    });

    expect(result).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("no rompe cuando crypto.randomUUID no esta disponible en el runtime", () => {
    const mathRandom = vi.fn(() => 0);

    const result = createRandomId({
      crypto: undefined,
      mathRandom,
    });

    expect(result).toBe("00000000-0000-4000-8000-000000000000");
    expect(mathRandom).toHaveBeenCalled();
  });
});
