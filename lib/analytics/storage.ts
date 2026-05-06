type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function getOrCreateStoredValue(
  storage: StorageLike,
  key: string,
  createValue: () => string,
): string {
  const existingValue = storage.getItem(key);

  if (existingValue) {
    return existingValue;
  }

  const nextValue = createValue();
  storage.setItem(key, nextValue);
  return nextValue;
}

export function markTrackedEvent(storage: StorageLike, key: string): boolean {
  if (storage.getItem(key)) {
    return false;
  }

  storage.setItem(key, "1");
  return true;
}
