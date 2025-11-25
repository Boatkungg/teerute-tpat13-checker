"use client";

import { DownloadIcon, FileSpreadsheetIcon, PlusIcon, TrashIcon } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "../ui/empty";
import { useState, useRef } from "react";
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableFileItem from "../sortable-file-item";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import * as XLSX from 'xlsx';

interface FileItem {
    id: string;
    file: File;
}

interface MergedData {
    data: string[][];
    fileName: string;
}

interface MergerPartProps {
    onMergedDataChange?: (data: string[][] | null) => void;
}

export default function MergerPart({ onMergedDataChange }: MergerPartProps) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [mergedData, setMergedData] = useState<MergedData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // File upload handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [
            ...prev,
            ...droppedFiles.map((file) => ({ id: crypto.randomUUID(), file })),
        ]);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prev) => [
                ...prev,
                ...selectedFiles.map((file) => ({ id: crypto.randomUUID(), file })),
            ]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    // Drag and drop sorting handlers
    const handleFileDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;

        if (!over || active.id === over.id) {
            return;
        }

        setFiles((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            return arrayMove(items, oldIndex, newIndex);
        });
    }

    const handleDelete = (id: string) => {
        setFiles((prev) => prev.filter((file) => file.id !== id));
    };


    const handleClearAll = () => {
        setFiles([]);
        setMergedData(null);
        onMergedDataChange?.(null);
    };

    const handleMerge = async () => {
        if (files.length === 0) return;

        try {
            // Store all file data: { studentId: { questionNumber: answer } }
            const studentDataMap = new Map<string, Map<string, string>>();
            const allQuestionNumbers: string[] = [];

            // Process each file
            for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                const fileItem = files[fileIndex];
                const arrayBuffer = await fileItem.file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });

                if (data.length < 2) continue; // Skip empty files

                const headers = data[0];
                const studentIdHeader = headers[0]; // "เลขประจำตัว"

                // Get question headers (skip first column which is student ID)
                const questionHeaders = headers.slice(1);

                // Renumber questions for this file (file 1 -> 1.x, file 2 -> 2.x, etc.)
                const fileNumber = fileIndex + 1;
                const renumberedQuestions = questionHeaders.map((_, index) => {
                    return `${fileNumber}.${index + 1}`;
                });

                // Add to all question numbers
                allQuestionNumbers.push(...renumberedQuestions);

                // Process data rows (skip header row)
                for (let i = 1; i < data.length; i++) {
                    const row = data[i];
                    if (!row || row.length === 0) continue;

                    const studentId = String(row[0] || '').trim();
                    if (!studentId) continue;

                    // Get or create student data map
                    if (!studentDataMap.has(studentId)) {
                        studentDataMap.set(studentId, new Map());
                    }
                    const studentQuestions = studentDataMap.get(studentId)!;

                    // Store answers with renumbered question numbers
                    for (let j = 0; j < renumberedQuestions.length; j++) {
                        const answer = row[j + 1] || '';
                        studentQuestions.set(renumberedQuestions[j], String(answer));
                    }
                }
            }

            // Build merged CSV data
            const mergedCsvData: string[][] = [];

            // Header row
            const headerRow = ['เลขประจำตัว', ...allQuestionNumbers];
            mergedCsvData.push(headerRow);

            // Data rows
            for (const [studentId, questionMap] of studentDataMap.entries()) {
                const row = [studentId];
                for (const questionNumber of allQuestionNumbers) {
                    row.push(questionMap.get(questionNumber) || '');
                }
                mergedCsvData.push(row);
            }

            // Set merged data
            const newMergedData = {
                data: mergedCsvData,
                fileName: 'merged-answer-sheet.csv'
            };
            setMergedData(newMergedData);

            // Notify parent component
            onMergedDataChange?.(mergedCsvData);

        } catch (error) {
            console.error('Error merging files:', error);
            alert('เกิดข้อผิดพลาดในการรวมไฟล์');
        }
    }

    const handleDownload = () => {
        if (!mergedData) return;

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(mergedData.data);
        XLSX.utils.book_append_sheet(wb, ws, "Merged");

        // Download the file
        XLSX.writeFile(wb, mergedData.fileName);
    }

    return (
        <div className="container max-w-xl flex flex-col mx-auto mt-12">
            <div className="mx-6">
                <h1 className=" text-2xl font-semibold mb-6">Merger</h1>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileInput}
                    className="hidden"
                />
                {files.length === 0 ? (
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`cursor-pointer transition-colors ${
                            isDragging ? "opacity-70" : ""
                        }`}
                    >
                        <Empty className="border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FileSpreadsheetIcon />
                                </EmptyMedia>
                                <EmptyTitle>
                                    ยังไม่ได้อัปโหลดไฟล์กระดาษคำตอบ
                                </EmptyTitle>
                                <EmptyDescription>
                                    กรุณาอัปโหลดไฟล์กระดาษคำตอบโดยการกดหรือวางไฟล์ลงในพื้นที่นี้
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                ) : (
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className=" text-lg">
                                จัดเรียงลำดับไฟล์
                            </CardTitle>
                            <CardAction className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={handleClick}>
                                    <PlusIcon />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={handleClearAll}>
                                    <TrashIcon />
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleFileDragEnd}
                                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                            >
                                <SortableContext items={files} strategy={verticalListSortingStrategy}>
                                    {files.map((item) => (
                                        <SortableFileItem key={item.id} name={item.file.name} id={item.id} onDelete={handleDelete} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleMerge}>รวมไฟล์</Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Merged Result Card */}
                {mergedData && (
                    <Card className="border mt-6">
                        <CardHeader>
                            <CardTitle className=" text-lg">
                                ไฟล์ที่รวมแล้ว
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheetIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{mergedData.fileName}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>จำนวนนักเรียน: {mergedData.data.length - 1} คน</p>
                                    <p>จำนวนข้อ: {mergedData.data[0].length - 1} ข้อ</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleDownload}>
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                ดาวน์โหลดไฟล์
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
