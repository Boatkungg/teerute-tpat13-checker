import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DeleteIcon, GripVerticalIcon } from "lucide-react";

interface SortableFileItemProps {
    name: string;
    id: string;
    onDelete: (id: string) => void;
}

export default function SortableFileItem({ name, id, onDelete }: SortableFileItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const handleDelete = () => {
        onDelete(id);
    }

    const isCursorGrabbing = attributes['aria-pressed'];
    
    return (
        <div ref={setNodeRef} style={style} key={id}>
            <Card className="p-3 relative flex flex-row justify-between gap-5 group">
                <div className="flex flex-col justify-center">{name}</div>
                <div className="flex justify-center items-center gap-2">
                    <Button size="icon-sm" variant="destructiveGhost" onClick={handleDelete} className="text-red-400">
                        <DeleteIcon />
                    </Button>
                    <Button {...attributes} {...listeners} size="icon-sm" variant="ghost" className={isCursorGrabbing ? 'cursor-grabbing' : 'cursor-grab'} aria-describedby={`DndContext-${id}`}>
                        <GripVerticalIcon />
                    </Button>
                </div>
            </Card>
        </div>
    )
}