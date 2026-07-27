"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const ViewETRAndMDTRNote = ({ note }: { note: string | null | undefined }) => {
	const [open, setOpen] = useState(false);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<Popover open={open}>
			<PopoverTrigger asChild onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
				<Button variant="link" size="sm" className="!border-none">
					{tEmployee.viewNote}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="max-w-[240px] whitespace-pre-wrap break-words p-2 text-sm">
				{note ? <p className="break-all leading-relaxed">{note}</p> : <p className="text-muted-foreground">N/A</p>}
			</PopoverContent>
		</Popover>
	);
};
