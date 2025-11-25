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
        Record<string, string | number | null>[]
    >([]);
    const [answer, setAnswer] = useState<
        Record<string, string | number | null>[]
    >([]);

    const handleImportFromMerger = () => {
        console.log("Importing data from Merger...");
        setDataToCheck(studentData);
    };

    useEffect(() => {
        if (answer.length > 0) {
            console.log(answer[0][1])
        }
    }, [answer])

    const handleCheckAnswers = () => {
        
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
                    {answer.length === 0 ? (
                        <UploadBox
                            icon={<FilePenIcon />}
                            title="ยังไม่ได้อัปโหลดไฟล์เฉลย"
                            description="กรุณาอัปโหลดไฟล์โดยการกดหรือวางไฟล์ลงในพื้นที่นี้"
                            onDataParsed={setAnswer}
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
                                    จำนวนข้อ: <span className="font-medium text-foreground">{answer.length}</span> ข้อ
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAnswer([])}
                                >
                                    ล้างข้อมูล
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
                {(dataToCheck.length > 0 && answer.length > 0) && (
                    <Button className="mt-6 w-full" onClick={handleCheckAnswers}>
                        <ListChecksIcon />
                        ตรวจคำตอบ
                    </Button>
                )}
            </div>
        </div>
    );
}
