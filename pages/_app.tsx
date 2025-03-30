import type { AppProps } from "next/app";
import Header from "@/src/components/Header";

import "@/styles/global.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Theme accentColor="green">
      <main> {/* Ensure spacing so header isn't hidden */}
        <Component {...pageProps} />
      </main>
    </Theme>
  );
}


