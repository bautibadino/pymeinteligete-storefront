type RuntimeCrypto = {
  randomUUID?: () => string;
  getRandomValues?: <T extends Uint8Array>(array: T) => T;
};

type CreateRandomIdOptions = {
  crypto?: RuntimeCrypto | undefined;
  mathRandom?: () => number;
};

function toHex(byte: number): string {
  return byte.toString(16).padStart(2, "0");
}

function formatUuidV4(bytes: Uint8Array): string {
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;

  const hex = Array.from(bytes, toHex);

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

function createMathRandomBytes(random: () => number): Uint8Array {
  const bytes = new Uint8Array(16);

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(random() * 256) & 0xff;
  }

  return bytes;
}

export function createRandomId(options: CreateRandomIdOptions = {}): string {
  const runtimeCrypto = "crypto" in options ? options.crypto : globalThis.crypto;

  if (typeof runtimeCrypto?.randomUUID === "function") {
    return runtimeCrypto.randomUUID();
  }

  if (typeof runtimeCrypto?.getRandomValues === "function") {
    return formatUuidV4(runtimeCrypto.getRandomValues(new Uint8Array(16)));
  }

  return formatUuidV4(createMathRandomBytes(options.mathRandom ?? Math.random));
}
