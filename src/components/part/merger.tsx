"use client";

import { FileSpreadsheetIcon, PlusIcon, TrashIcon } from "lucide-react";
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
import * as XLSX from "xlsx";

interface FileItem {
    id: string;
    file: File;
}

export default function MergerPart() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
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
    };

    const handleMerge = async () => {
        if (files.length === 0) return;

        try {
            const studentData = new Map<string, Record<string, string | number>>();
            let maxQuestionNumber = 0;
            // TODO: Fix this hardcoded student ID column
            const allColumns: string[] = ["เลขประจำตัว"]

            for (const item of files) {
                const arrayBuffer = await item.file.arrayBuffer();
                // TODO: Fix "Codepage tables are not loaded.  Non-ASCII characters may not give expected results"
                const workbook = XLSX.read(arrayBuffer, { type: "array", codepage: 65001 });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);
                console.log(data)

                if (data.length === 0) continue;

                // TODO: Fix this hardcoded student ID column
                const columns = Object.keys(data[0]).filter(col => col !== "เลขประจำตัว")
                console.log(columns)

                const offset = maxQuestionNumber;

                const columnMapping: Record<string, string> = {}
                for (const col of columns) {
                    // Find the question number and answer number
                    const match = col.match(/^(\d+)\.(\d+)$/);
                    if (match) {
                        const questionNumber = parseInt(match[1]) + offset
                        const answerNumber = match[2]
                        const newColumnName = `${questionNumber}.${answerNumber}`
                        columnMapping[col] = newColumnName
                        allColumns.push(newColumnName)

                        maxQuestionNumber = Math.max(maxQuestionNumber, questionNumber)
                    } else {
                        columnMapping[col] = col
                        allColumns.push(col)
                    }
                }

                // TODO: Fix this hardcoded student ID column
                for (const row of data) {
                    const id = row["เลขประจำตัว"]
                    if (!studentData.has(id.toString())) {
                        studentData.set(id.toString(), { ["เลขประจำตัว"]: id })
                    }

                    const existingStudent = studentData.get(id.toString())!
                    for (const col of columns) {
                        const newColumnName = columnMapping[col]
                        existingStudent[newColumnName] = row[col]
                    }

                }
                
            }
            console.log(allColumns)
            console.log(studentData)

            const result: Record<string, string | number>[] = []
            for (const student of studentData.values()) {
                const orderedData: Record<string, string | number> = {}
                for (const col of allColumns) {
                    orderedData[col] = student[col] ?? ""
                }
                result.push(orderedData)
            }

            console.log(result)

            const newSheet = XLSX.utils.json_to_sheet(result, { header: allColumns})
            const newWorkbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Merged")

            // TODO: display and share to next part
        } catch (error) {
            console.error('Error merging files:', error)
        }
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

                {/* drag and drop */}
                {files.length === 0 ? (
                    <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`cursor-pointer transition-colors ${isDragging ? "opacity-70" : ""
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

                {/* merge result */}
                {}
            </div>
        </div>
    );
}
