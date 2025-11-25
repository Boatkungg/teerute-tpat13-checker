"use client";

import * as React from "react";
import * as XLSX from "@e965/xlsx";
import { set_cptable } from "@e965/xlsx";
import * as cptable from "@e965/xlsx/dist/cpexcel.full.mjs";
set_cptable(cptable);
import { cn } from "@/lib/utils";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "./ui/empty";

interface UploadBoxProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    accept?: string;
    onDataParsed: (data: Record<string | number, string | number| null>[]) => void;
    children?: React.ReactNode;
    className?: string;
}

export function UploadBox({
    icon,
    title,
    description,
    accept = ".xlsx,.xls,.csv",
    onDataParsed,
    children,
    className,
}: UploadBoxProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const parseFile = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array", codepage: 65001 });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json<Record<string, string | number| null>>(sheet);
            console.log("Parsed data:", data);
            onDataParsed(data);
        } catch (error) {
            console.error("Error parsing file:", error);
        }
    };

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
        if (droppedFiles.length > 0) {
            parseFile(droppedFiles[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            parseFile(e.target.files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn("cursor-pointer", className)}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
            />
            <Empty
                className={cn(
                    "border border-dashed w-full h-full transition-colors",
                    isDragging && "border-primary bg-primary/5"
                )}
            >
                <EmptyHeader>
                    <EmptyMedia variant="icon">{icon}</EmptyMedia>
                    <EmptyTitle>{title}</EmptyTitle>
                    <EmptyDescription>{description}</EmptyDescription>
                </EmptyHeader>
                {children && (
                    <EmptyContent onClick={(e) => e.stopPropagation()}>
                        {children}
                    </EmptyContent>
                )}
            </Empty>
        </div>
    );
}
