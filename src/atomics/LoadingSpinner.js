import React from "react";
import { ThreeDots } from "react-loader-spinner";

export default function LoadingSpinner() {
  return (
    <ThreeDots
      visible={true}
      height="120"
      width="120"
      color="#4fa94d"
      radius="12"
      ariaLabel="three-dots-loading"
      wrapperStyle={{
        margin: "auto",
        display: "block",
        textAlign: "center",
      }}
    />
  );
}
