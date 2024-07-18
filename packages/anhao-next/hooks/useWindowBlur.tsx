import { useEffect } from "react";

type EventHandler = () => void;

const useWindowBlur = (onBlur: EventHandler) => {
  useEffect(() => {
    const handleBlur = () => {
      onBlur();
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [onBlur]);
};

export default useWindowBlur;
