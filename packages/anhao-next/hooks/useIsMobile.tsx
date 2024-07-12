import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedIsMobile = localStorage.getItem("isMobile") === "true";
    setIsMobile(storedIsMobile);

    const handleResize = () => {
      const mobileState = window.innerWidth <= 768;
      setIsMobile(mobileState);
      localStorage.setItem("isMobile", mobileState.toString());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default useIsMobile;
