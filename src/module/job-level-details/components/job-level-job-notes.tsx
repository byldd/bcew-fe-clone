"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { JobLevelCommsJobNote } from "../utils/types";
import { FALLBACK } from "../constants";

export const JobLevelJobNotes = ({ notes }: { notes: JobLevelCommsJobNote[] }) => {
	const [open, setOpen] = useState(false);

	if (!notes.length) {
		return <p className="text-sm font-medium text-brand-dark">{FALLBACK}</p>;
	}

	return (
		<Popover open={open}>
			<PopoverTrigger asChild onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
				<Button variant="link" size="sm" className="h-auto border-none p-0 text-sm font-medium">
					View Notes
				</Button>
			</PopoverTrigger>
			<PopoverContent className="max-h-[280px] w-max max-w-[min(360px,calc(100vw-2rem))] space-y-3 overflow-y-auto">
				{notes.map((noteItem, index) => (
					<div key={noteItem.id} className="space-y-1">
						<div className="flex justify-between gap-4 text-xs font-medium text-brand-dark50">
							<span>{toLocalFormattedDate(noteItem.createdAt, DATE_FORMAT.MM_DD_YYYY)}</span>
							<span>{toLocalFormattedDate(noteItem.createdAt, DATE_FORMAT.HH_MM_AA_PM)}</span>
						</div>
						<div className="flex justify-between gap-4 text-xs font-medium text-brand-dark50">
							<p className="break-words text-sm font-medium text-brand-dark">{noteItem.note}</p>
							<span className="shrink-0">{noteItem.user?.name}</span>
						</div>
						{index !== notes.length - 1 && <Separator className="!my-3 bg-brand-dark10" />}
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
};
