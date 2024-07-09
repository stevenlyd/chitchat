import { AppContext } from "@/app/_context/AppContext";
import { Spinner } from "@nextui-org/react";
import { ReactNode, useContext } from "react";

export const LoadingIndicatorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isConnecting } = useContext(AppContext);
  return (
    <>
      {children}
      {isConnecting && (
        <div className="backdrop-blur-sm fixed inset-0 flex justify-center items-center">
          <Spinner size="lg" className="absolute" />
        </div>
      )}
    </>
  );
};
