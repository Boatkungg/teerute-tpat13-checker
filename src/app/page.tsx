"use client";

import Footer from "@/components/footer";
import CheckerPart from "@/components/part/checker";
import MergerPart from "@/components/part/merger";
import { useState } from "react";

export default function MainPage() {
  const [studentData, setStudentData] = useState<Record<string, string | number>[]>([]);

  const handleMergeComplete = (data: Record<string, string | number>[]) => {
    setStudentData(data);
  }

  return (
    <main className=" flex flex-col justify-between min-h-screen">
      <div>
        <MergerPart onMergeComplete={handleMergeComplete} />
        <CheckerPart studentData={studentData} />
      </div>
      <Footer />
    </main>
  );
}