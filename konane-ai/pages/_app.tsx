import "../styles/globals.scss";
import type { AppProps } from "next/app";
import React from "react";
import SideBar from "../components/SideBar/SideBar";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SideBar navigation={true} left={true} />
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
