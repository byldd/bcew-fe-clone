"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IViewJobNotes } from "../types";

export const ViewJobNotes = ({ overrideReason, overTimeReason, dailyJobNotes }: IViewJobNotes) => {
	const [open, setOpen] = useState(false);

	const hasNotes =
		(overrideReason && overrideReason.trim() !== "") ||
		(overTimeReason && overTimeReason.trim() !== "") ||
		(dailyJobNotes && dailyJobNotes.length > 0);

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
						{overrideReason && (
							<div className="space-y-1">
								<p className="text-xs font-normal text-muted-foreground">Override Reason (By Admin/Scheduler)</p>
								<p className="text-sm font-medium">{overrideReason || "N/A"}</p>
							</div>
						)}
						{overTimeReason && (
							<div className="space-y-1">
								<p className="font-normaltext-muted-foreground text-xs">Overtime reason (By Employee)</p>
								<p className="text-sm font-medium">{overTimeReason || "N/A"}</p>
							</div>
						)}
						{dailyJobNotes && dailyJobNotes?.length > 0 && (
							<div className="space-y-1">
								<p className="text-xs font-normal text-muted-foreground">Job Notes (By Task Leader/Employee)</p>
								{dailyJobNotes.map((notes, index) => (
									<p key={index} className="text-sm font-medium">
										{index + 1}. {notes.note || "N/A"}
									</p>
								))}
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
