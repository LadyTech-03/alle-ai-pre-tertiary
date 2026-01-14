"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

interface ProvidersProps {
  children: React.ReactNode;
}
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#007bff" // used a blue color
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};

export default Providers;
