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

    const handleMerge = () => {
        // Implement merge functionality here
    }

    return (
        <div className="container max-w-xl flex flex-col mx-auto mt-12">
            <div className="mx-6">
                <h1 className=" text-2xl font-semibold mb-6">Merger</h1>
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
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className=" text-lg">
                                จัดเรียงลำดับไฟล์
                            </CardTitle>
                            <CardAction className="flex gap-2">
                                <Button variant="outline" size="icon">
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
                            <Button className="w-full">รวมไฟล์</Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
