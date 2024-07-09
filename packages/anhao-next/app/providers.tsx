"use client";

import { NextUIProvider, Spinner } from "@nextui-org/react";
import { AppContextProvider } from "./_context/AppContext";
import ToastProvider from "./_components/toast";
import { Suspense } from "react";
import { LoadingIndicatorProvider } from "./_components/loading-indicator";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <Suspense fallback={<Spinner />}>
        <AppContextProvider>
          <LoadingIndicatorProvider>
            <ToastProvider>{children}</ToastProvider>
          </LoadingIndicatorProvider>
        </AppContextProvider>
      </Suspense>
    </NextUIProvider>
  );
}
