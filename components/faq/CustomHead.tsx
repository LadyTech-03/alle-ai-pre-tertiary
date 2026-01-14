"use client";
import { useEffect } from "react";

interface CustomHeadProps {
  title: string;
}

const CustomHead: React.FC<CustomHeadProps> = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};

export default CustomHead;
