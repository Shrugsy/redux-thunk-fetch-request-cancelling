import { useRef, useEffect } from "react";

export default function useIsMountedRef() {
  const hookIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      hookIsMounted.current = false;
    };
  }, []);
  return hookIsMounted;
}
