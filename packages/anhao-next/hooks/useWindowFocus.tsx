import { useEffect } from "react";

type EventHandler = () => void;

const useWindowFocus = (onFocus: EventHandler) => {
  useEffect(() => {
    const handleFocus = () => {
      onFocus();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [onFocus]);
};

export default useWindowFocus;
