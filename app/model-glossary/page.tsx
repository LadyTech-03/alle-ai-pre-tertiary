"use client";
import { useEffect } from "react";
import { useSidebarStore } from "@/stores";
import ModelGlossary from '@/components/features/model-glossary/ModelGlossary';


export default function ModelGlossaryPage() {
  const setCurrentPage = useSidebarStore((state) => state.setCurrentPage);


  useEffect(() => {
    setCurrentPage("model-glossary");
  }, [setCurrentPage]);

  return (
    <div className="bg-background">
      <ModelGlossary />
    </div>
  );
}
