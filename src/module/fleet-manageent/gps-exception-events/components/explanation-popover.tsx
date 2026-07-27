import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const ExplanationPopover = ({ note }: { note: string }) => {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="link" size="sm" className="underlines border-none">
					View Explanation
				</Button>
			</PopoverTrigger>
			<PopoverContent className={note ? "max-h-[200px] w-auto max-w-[260px] overflow-y-auto p-2" : "w-auto p-2"}>
				{note ? (
					<p className="break-words text-justify text-xs leading-relaxed text-brand-dark">{note}</p>
				) : (
					<p className="whitespace-nowrap text-xs text-brand-grey">No notes added.</p>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default ExplanationPopover;
