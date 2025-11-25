"use client";

import MergerPart from "@/components/part/merger";
import { useState } from "react";

export default function MainPage() {
  const [mergedData, setMergedData] = useState<string[][] | null>(null);

  const handleMergedData = (data: string[][] | null) => {
    setMergedData(data);
    // This data can now be passed to the checker component when needed
  };

  return (
    <main className="">
      <MergerPart onMergedDataChange={handleMergedData} />
      {/* Checker component will go here and receive mergedData */}
    </main>
  );
}