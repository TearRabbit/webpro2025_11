// pages/_app.tsx
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider
      session={session}
      refetchInterval={5 * 60}          // 5分ごとにセッションを再取得
      refetchOnWindowFocus={true}       // フォーカスが戻った時に再取得
    >
      <Component {...pageProps} />
    </SessionProvider>
  );
}
