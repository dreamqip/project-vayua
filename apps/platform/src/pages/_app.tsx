import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { useEffect } from "react";
import Toaster from "@/components/ui/Toaster";
import { thetaTestnet } from "@/utils/chains/theta-testnet";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const { chains, provider, webSocketProvider } = configureChains(
  [thetaTestnet],
  [publicProvider()]
);

const client = createClient({
  // Causes hydration error, see https://github.com/wagmi-dev/wagmi/issues/542
  autoConnect: false,
  provider,
  webSocketProvider,
});

export default function App({ Component, pageProps }: AppProps) {
  // This is the hack to prevent the hydration error
  useEffect(() => {
    client.autoConnect();
    document.documentElement.classList.add(inter.variable);
  }, []);

  return (
    <div className={`font-sans px-4 sm:container ${inter.variable}`}>
      <WagmiConfig client={client}>
        <Component {...pageProps} />
        <Toaster />
      </WagmiConfig>
    </div>
  );
}
