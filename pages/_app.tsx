import type { AppProps } from "next/app";
import { Bebas_Neue, Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "../styles/globals.css";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${bebas.variable} ${cormorant.variable} ${josefin.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
