import {
  learningStateSchema,
  newState,
  type LearningState,
} from "@shared/learning";
export const guestStorageKey = "datapath.guest.v1";
type GuestStorage = Pick<Storage, "getItem" | "setItem">;
export function readGuestStorage(storage: GuestStorage): LearningState {
  try {
    const raw = storage.getItem(guestStorageKey);
    if (raw) return learningStateSchema.parse(JSON.parse(raw));
  } catch {
    /* Keep unreadable input intact for recovery when writing. */
  }
  return newState();
}
export function writeGuestStorage(storage: GuestStorage, state: LearningState) {
  const raw = storage.getItem(guestStorageKey);
  let recovered = false;
  if (raw) {
    try {
      learningStateSchema.parse(JSON.parse(raw));
    } catch {
      // Never overwrite a previous recovery copy. If storage is unavailable,
      // this throws before the original workspace is replaced.
      let key = `${guestStorageKey}.recovery`;
      let index = 1;
      while (storage.getItem(key) !== null)
        key = `${guestStorageKey}.recovery.${index++}`;
      storage.setItem(key, raw);
      recovered = true;
    }
  }
  storage.setItem(guestStorageKey, JSON.stringify(state));
  return { recovered };
}
