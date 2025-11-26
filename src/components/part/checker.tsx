"use client";

import {
    DownloadIcon,
    FilePenIcon,
    FileSpreadsheetIcon,
    ListChecksIcon,
    PlusIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { UploadBox } from "../upload-box";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { parseAnswerCode } from "@/lib/utils";
import { Input } from "../ui/input";
import * as XLSX from "@e965/xlsx";

interface CheckerPartProps {
    studentData?: Record<string, string | number>[];
}

export default function CheckerPart({ studentData = [] }: CheckerPartProps) {
    const [dataToCheck, setDataToCheck] = useState<
        Record<string, string | number>[]
    >([]);
    const [trueAnswer, setTrueAnswer] = useState<
        Record<string, string | number>[]
    >([]);
    const [calculatedScores, setCalculatedScores] = useState<
        Record<string, number | string>[]
    >([]);
    const [scoreCorrect, setScoreCorrect] = useState<number | null>(null);
    const [scoreIncorrect, setScoreIncorrect] = useState<number | null>(null);

    const handleImportFromMerger = () => {
        console.log("Importing data from Merger...");
        setDataToCheck(studentData);
    };

    const handleClearDataToCheck = () => {
        setDataToCheck([]);
        setCalculatedScores([]);
    };

    const handleClearTrueAnswer = () => {
        setTrueAnswer([]);
        setCalculatedScores([]);
    };

    const handleCheckAnswers = () => {
        if (dataToCheck.length === 0 || trueAnswer.length === 0) return;

        const answerMap = trueAnswer.reduce<Record<string, string[]>>(
            (acc, item) => {
                const questionNumber = item["ข้อที่"]?.toString();
                if (!questionNumber) return acc;

                const answers = Object.keys(item)
                    .filter((key) => key !== "ข้อที่")
                    .map((key) => item[key].toString());

                acc[questionNumber] = answers;
                return acc;
            },
            {}
        );

        // sum of the answers inside each question in the answerMap
        const sumAnswers = Object.values(answerMap).reduce((acc, answers) => {
            return acc + answers.length;
        }, 0);

        const scorePerCorrect = scoreCorrect || 100 / sumAnswers;
        const scorePerIncorrect = scoreIncorrect || -3;

        console.log("Answer Map:", answerMap);
        console.log("Data to Check:", dataToCheck);

        console.log("Score per correct answer:", scorePerCorrect);
        console.log("Score per incorrect answer:", scorePerIncorrect);

        function calculateScore({
            studentAnswers,
            correctAnswers,
        }: {
            studentAnswers: string[];
            correctAnswers: string[];
        }): number {
            const uniqueStudentAnswers = new Set(studentAnswers);
            const uniqueCorrectAnswers = new Set(correctAnswers);

            // Count correct answers
            const numCorrect =
                uniqueStudentAnswers.intersection(uniqueCorrectAnswers).size;

            // Count duplicate answers
            const numDuplicates =
                studentAnswers.length - uniqueStudentAnswers.size;

            // Count incorrect answers
            const numIncorrect =
                uniqueStudentAnswers.difference(uniqueCorrectAnswers).size;

            const numPenalty = numDuplicates + numIncorrect;

            const rawScore =
                numCorrect * scorePerCorrect + numPenalty * scorePerIncorrect;

            // console.log(`Calculating score: Correct = ${numCorrect}, Duplicates = ${numDuplicates}, Incorrect = ${numIncorrect}, Raw Score = ${rawScore}`);

            return Math.max(0, rawScore); // Ensure score is not negative
        }

        const results = dataToCheck.reduce<Record<string, number | string>[]>(
            (acc, student) => {
                // Assuming student ID is stored under the key "เลขประจำตัว"
                // We will first group answers by question number
                // Example student object: { "เลขประจำตัว": "12345", "1.1": "1&11&21", "1.2": "", "1.3": "1&11&21", ... }
                const studentId =
                    student["เลขประจำตัว"]?.toString() || "Unknown";
                const studentAnswersByQuestion: Record<string, string[]> = {};

                Object.keys(student).forEach((key) => {
                    if (key === "เลขประจำตัว") return;

                    const questionNumber = key.split(".")[0];
                    const answerCode = student[key]?.toString() || "";
                    if (!studentAnswersByQuestion[questionNumber]) {
                        studentAnswersByQuestion[questionNumber] = [];
                    }

                    if (answerCode) {
                        const parsedAnswer = parseAnswerCode(answerCode);
                        studentAnswersByQuestion[questionNumber].push(
                            parsedAnswer
                        );
                    }
                });

                // console.log("Student ID:", studentId);
                // console.log("Student Answers by Question:", studentAnswersByQuestion);

                // Now calculate the total score for the student
                let totalScore = 0;
                Object.keys(answerMap).forEach((questionNumber) => {
                    const correctAnswers = answerMap[questionNumber];
                    const studentAnswers =
                        studentAnswersByQuestion[questionNumber] || [];
                    const questionScore = calculateScore({
                        studentAnswers,
                        correctAnswers,
                    });
                    totalScore += questionScore;
                    // console.log(`Question ${questionNumber}: Student Answers = ${studentAnswers}, Correct Answers = ${correctAnswers}, Question Score = ${questionScore}`);
                });

                return acc.concat([
                    { เลขประจำตัว: studentId, คะแนน: totalScore },
                ]);
            },
            []
        );

        console.log("Results:", results);
        setCalculatedScores(results);
    };

    const handleDownloadResults = () => {
        if (calculatedScores.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(calculatedScores);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ผลการตรวจคำตอบ");

        XLSX.writeFile(workbook, "ผลการตรวจคำตอบ.csv");
    };

    return (
        <div className="container max-w-xl flex flex-col mx-auto mt-12 mb-24">
            <div className="mx-6">
                <h1 className="text-2xl font-semibold mb-4">Checker</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dataToCheck.length === 0 ? (
                        <UploadBox
                            icon={<FileSpreadsheetIcon />}
                            title="ยังไม่ได้อัปโหลดไฟล์กระดาษคำตอบ"
                            description="กรุณาอัปโหลดไฟล์โดยการกดหรือวางไฟล์ลงในพื้นที่นี้"
                            onDataParsed={setDataToCheck}
                        >
                            <Button
                                className={
                                    studentData.length === 0
                                        ? "opacity-50 pointer-events-none"
                                        : ""
                                }
                                onClick={handleImportFromMerger}
                            >
                                <PlusIcon />
                                เพิ่มจาก Merger
                            </Button>
                        </UploadBox>
                    ) : (
                        <Card className="border w-full h-full justify-between">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileSpreadsheetIcon className="h-5 w-5" />
                                    กระดาษคำตอบ
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    จำนวนนักเรียน:{" "}
                                    <span className="font-medium text-foreground">
                                        {dataToCheck.length}
                                    </span>{" "}
                                    คน
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearDataToCheck}
                                >
                                    ล้างข้อมูล
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                    {trueAnswer.length === 0 ? (
                        <UploadBox
                            icon={<FilePenIcon />}
                            title="ยังไม่ได้อัปโหลดไฟล์เฉลยคำตอบ"
                            description="กรุณาอัปโหลดไฟล์โดยการกดหรือวางไฟล์ลงในพื้นที่นี้"
                            onDataParsed={setTrueAnswer}
                        >
                            <a href="/template_เฉลย.csv" download>
                                <Button>
                                    <DownloadIcon />
                                    ดาวน์โหลด template
                                </Button>
                            </a>
                        </UploadBox>
                    ) : (
                        <Card className="border w-full h-full justify-between">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FilePenIcon className="h-5 w-5" />
                                    เฉลย
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    จำนวนข้อ:{" "}
                                    <span className="font-medium text-foreground">
                                        {trueAnswer.length}
                                    </span>{" "}
                                    ข้อ
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearTrueAnswer}
                                >
                                    ล้างข้อมูล
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
                {dataToCheck.length > 0 && trueAnswer.length > 0 && (
                    <Card className="w-full mt-4">
                        <CardHeader>
                            <CardTitle>ตั้งค่าการตรวจคำตอบ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className=" w-full">
                                    <p>คะแนนต่อข้อถูก</p>
                                    <p className=" text-sm text-muted-foreground">
                                        เว้นว่างไว้เพื่อให้ระบบคำนวณอัตโนมัติ
                                    </p>
                                    <Input
                                        type="number"
                                        onChange={(e) =>
                                            setScoreCorrect(
                                                parseFloat(e.target.value)
                                            )
                                        }
                                        defaultValue={scoreCorrect ?? undefined}
                                    />
                                </div>
                                <div className=" w-full">
                                    <p>คะแนนต่อข้อผิด</p>
                                    <p className=" text-sm text-muted-foreground">
                                        เว้นว่างไว้เพื่อใช้ค่าเริ่มต้น (-3)
                                    </p>
                                    <Input
                                        type="number"
                                        onChange={(e) =>
                                            setScoreIncorrect(
                                                parseFloat(e.target.value)
                                            )
                                        }
                                        defaultValue={
                                            scoreIncorrect ?? undefined
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleCheckAnswers}
                            >
                                <ListChecksIcon />
                                ตรวจคำตอบ
                            </Button>
                        </CardFooter>
                    </Card>
                )}
                {calculatedScores.length > 0 && (
                    <Card className="w-full mt-6">
                        <CardHeader>
                            <CardTitle>ผลการตรวจคำตอบ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                ผลการตรวจคำตอบพร้อมให้ดาวน์โหลดแล้ว
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleDownloadResults}
                            >
                                <DownloadIcon />
                                ดาวน์โหลดผลการตรวจคำตอบ
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
