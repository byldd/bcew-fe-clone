"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ViewLatenessNotesProps {
	lateEmployeeNote?: string | null;
	lateAdminNote?: string | null;
	earlyEmployeeNote?: string | null;
	earlyAdminNote?: string | null;
}

export const ViewLatenessNotes = ({
	lateEmployeeNote,
	lateAdminNote,
	earlyEmployeeNote,
	earlyAdminNote,
}: ViewLatenessNotesProps) => {
	const [open, setOpen] = useState(false);

	const hasLateNotes =
		(lateEmployeeNote && lateEmployeeNote.trim() !== "") || (lateAdminNote && lateAdminNote.trim() !== "");

	const hasEarlyNotes =
		(earlyEmployeeNote && earlyEmployeeNote.trim() !== "") || (earlyAdminNote && earlyAdminNote.trim() !== "");

	const hasAnyNotes = hasLateNotes || hasEarlyNotes;

	return (
		<Popover open={open}>
			<PopoverTrigger asChild onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
				<Button variant="link" size="sm">
					View Notes
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-[300px] space-y-3">
				{!hasAnyNotes ? (
					<p className="py-1 text-center text-sm text-brand-grey">No notes added.</p>
				) : (
					<>
						{/* ---------------- Late Arrival ---------------- */}
						{hasLateNotes && (
							<div>
								<p className="mb-1 text-xs font-semibold text-brand-dark">Late Arrival</p>

								{lateEmployeeNote && (
									<div className="mb-2">
										<p className="text-xs text-brand-grey">Employee Note</p>
										<p className="text-xs">{lateEmployeeNote}</p>
									</div>
								)}

								{lateAdminNote && (
									<div>
										<p className="text-xs text-brand-grey">Admin Note</p>
										<p className="text-xs">{lateAdminNote}</p>
									</div>
								)}
							</div>
						)}

						{/* ---------------- Early Departure ---------------- */}
						{hasEarlyNotes && (
							<div>
								<p className="mb-1 text-xs font-semibold text-brand-dark">Early Departure</p>

								{earlyEmployeeNote && (
									<div className="mb-2">
										<p className="text-xs text-brand-grey">Employee Note</p>
										<p className="text-xs">{earlyEmployeeNote}</p>
									</div>
								)}

								{earlyAdminNote && (
									<div>
										<p className="text-xs text-brand-grey">Admin Note</p>
										<p className="text-xs">{earlyAdminNote}</p>
									</div>
								)}
							</div>
						)}
					</>
				)}
			</PopoverContent>
		</Popover>
	);
};
