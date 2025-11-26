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
import { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { parseAnswerCode } from "@/lib/utils";

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

    const handleImportFromMerger = () => {
        console.log("Importing data from Merger...");
        setDataToCheck(studentData);
    };

    useEffect(() => {
        if (trueAnswer.length > 0) {
            console.log(trueAnswer)
        }
    }, [trueAnswer])

    const handleCheckAnswers = () => {
        if (dataToCheck.length === 0 || trueAnswer.length === 0) return;

        const answerMap = trueAnswer.reduce<Record<string, string[]>>((acc, item) => {
            const questionNumber = item["ข้อที่"]?.toString();
            if (!questionNumber) return acc;

            const answers = Object.keys(item)
                .filter((key) => key !== "ข้อที่")
                .map((key) => item[key].toString());
                
            acc[questionNumber] = answers;
            return acc;
        }, {})

        // const answerMap: Record<string, Array<string>> = {};
        // // e.g. {1: '30E', ข้อที่: 1}

        // trueAnswer.forEach((item) => {
        //     const questionNumber = item["ข้อที่"]?.toString() || "";

        //     if (!questionNumber) return;

        //     const answersCol = Object.keys(item).filter((key) => key !== "ข้อที่");
        //     const answers: string[] = [];

        //     answersCol.forEach((col) => {
        //         answers.push(item[col].toString());
        //     })

        //     answerMap[questionNumber] = answers;
        // })

        console.log("Answer Map:", answerMap);
    };

    return (
        <div className="container max-w-xl flex flex-col mx-auto mt-12">
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
                                    จำนวนนักเรียน: <span className="font-medium text-foreground">{dataToCheck.length}</span> คน
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDataToCheck([])}
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
                            <Button>
                                <DownloadIcon />
                                ดาวน์โหลด template
                            </Button>
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
                                    จำนวนข้อ: <span className="font-medium text-foreground">{trueAnswer.length}</span> ข้อ
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setTrueAnswer([])}
                                >
                                    ล้างข้อมูล
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
                {(dataToCheck.length > 0 && trueAnswer.length > 0) && (
                    <Button className="mt-6 w-full" onClick={handleCheckAnswers}>
                        <ListChecksIcon />
                        ตรวจคำตอบ
                    </Button>
                )}
            </div>
        </div>
    );
}
