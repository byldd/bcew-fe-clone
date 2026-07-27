"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IJobEmployeeNotes } from "../../weekly-schedule-management/types/schedule-interface";

export const ViewNoteModal = ({ jobEmployeeNotes }: { jobEmployeeNotes: IJobEmployeeNotes }) => {
	const [open, setOpen] = useState(false);
	const { note, overrideReason, pauseReason } = jobEmployeeNotes || {};

	const hasNotes =
		(pauseReason && pauseReason.trim() !== "") ||
		(note && note.trim() !== "") ||
		(overrideReason && overrideReason.trim() !== "");

	return (
		<Popover open={open}>
			<PopoverTrigger asChild onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
				<Button variant="link" size="sm" className="border-none">
					View Notes
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={hasNotes ? "w-max max-w-[min(360px,calc(100vw-2rem))]" : "w-auto max-w-[calc(100vw-2rem)] px-3 py-2"}
			>
				{hasNotes ? (
					<>
						{pauseReason && (
							<div className="mb-2">
								<p className="mb-1 text-xs font-normal text-brand-grey">Reason for the pause (By Employee)</p>
								<p className="text-xs font-normal">{pauseReason || "N/A"}</p>
							</div>
						)}
						{note && (
							<div className="mb-2">
								<p className="mb-1 text-xs font-normal text-brand-grey">Day End Note (By Employee)</p>
								<p className="text-xs font-normal">{note || "N/A"}</p>
							</div>
						)}
						{overrideReason && (
							<div className="mb-2">
								<p className="mb-1 text-xs font-normal text-brand-grey">Override Reason (By Admin/Scheduler)</p>
								<p className="text-xs font-normal">{overrideReason || "N/A"}</p>
							</div>
						)}
					</>
				) : (
					<p className="text-xs text-brand-grey">No notes added.</p>
				)}
			</PopoverContent>
		</Popover>
	);
};
