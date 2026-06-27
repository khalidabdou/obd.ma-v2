"use client";

import { ReactNode } from "react";
import { useTranslation } from "@/Context/LanguageContext";

const DirectionWrapper = ({ children }: { children: ReactNode }) => {
  const { dir } = useTranslation();

  return <div dir={dir}>{children}</div>;
};

export default DirectionWrapper;
