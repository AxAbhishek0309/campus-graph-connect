import { useEffect, useState } from "react";
import { useApp } from "./store";

let started = false;
export function startHydration() {
  if (started) return;
  started = true;
  void useApp.persist.rehydrate();
}

export function useStoreHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    if (useApp.persist.hasHydrated()) {
      setH(true);
      return;
    }
    const unsub = useApp.persist.onFinishHydration(() => setH(true));
    startHydration();
    return unsub;
  }, []);
  return h;
}
