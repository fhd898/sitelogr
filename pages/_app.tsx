import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import Breadcrumb from "../components/Breadcrumb";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Breadcrumb />
      <Component {...pageProps} />
    </AuthProvider>
  );
}
