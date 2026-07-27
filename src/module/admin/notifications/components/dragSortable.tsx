"use client";

import {
	DndContext,
	closestCenter,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
	DragOverlay,
	type DragEndEvent,
	type DragStartEvent,
} from "@dnd-kit/core";

import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

function SortableItem<T>({
	id,
	item,
	index,
	isAnyDragging,
	renderItem,
}: {
	id: string;
	item: T;
	index: number;
	isAnyDragging: boolean;
	renderItem: (
		item: T,
		index: number,
		dragHandleProps: React.HTMLAttributes<HTMLElement>,
		isAnyDragging: boolean
	) => React.ReactNode;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

	// Filter out undefined aria-* values to prevent SSR/client hydration mismatch
	const cleanAttributes = Object.fromEntries(
		Object.entries(attributes).filter(([, v]) => v !== undefined)
	) as React.HTMLAttributes<HTMLElement>;

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
		pointerEvents: isDragging ? ("none" as const) : ("auto" as const),
	};

	return (
		<div ref={setNodeRef} style={style}>
			{renderItem(item, index, { ...cleanAttributes, ...listeners }, isAnyDragging)}
		</div>
	);
}

type DragSortableProps<T> = {
	items: T[];
	onChange: (items: T[]) => void;
	getId: (item: T) => string;
	renderItem: (
		item: T,
		index: number,
		dragHandleProps: React.HTMLAttributes<HTMLElement>,
		isAnyDragging: boolean
	) => React.ReactNode;
	renderOverlay?: (item: T) => React.ReactNode;
	className?: string;
};

export function DragSortable<T>({
	items,
	onChange,
	getId,
	renderItem,
	renderOverlay,
	className,
}: DragSortableProps<T>) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
	);

	const [activeId, setActiveId] = useState<string | null>(null);
	const activeItem = items.find((i) => getId(i) === activeId);
	const isAnyDragging = activeId !== null;

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			setActiveId(null);
			return;
		}
		const oldIndex = items.findIndex((i) => getId(i) === active.id);
		const newIndex = items.findIndex((i) => getId(i) === over.id);
		onChange(arrayMove(items, oldIndex, newIndex));
		setActiveId(null);
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={items.map(getId)} strategy={rectSortingStrategy}>
				<div className={className}>
					{items.map((item, index) => (
						<SortableItem
							key={getId(item)}
							id={getId(item)}
							item={item}
							index={index}
							isAnyDragging={isAnyDragging}
							renderItem={renderItem}
						/>
					))}
				</div>
			</SortableContext>

			<DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
				{activeItem && renderOverlay ? renderOverlay(activeItem) : null}
			</DragOverlay>
		</DndContext>
	);
}
