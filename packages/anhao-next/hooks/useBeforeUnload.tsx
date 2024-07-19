import React, { useEffect } from "react";

const useBeforeUnload = (callback: () => void) => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // event.preventDefault();
      // event.returnValue = '';
      callback();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [callback]);
};

export default useBeforeUnload;
