"use client";

import CheckerPart from "@/components/part/checker";
import MergerPart from "@/components/part/merger";
import { useState } from "react";

export default function MainPage() {
  const [studentData, setStudentData] = useState<Record<string, string | number>[]>([]);

  const handleMergeComplete = (data: Record<string, string | number>[]) => {
    setStudentData(data);
  }

  return (
    <main className="">
      <MergerPart onMergeComplete={handleMergeComplete} />
      <CheckerPart studentData={studentData} />
    </main>
  );
}