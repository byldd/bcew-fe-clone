"use client";

import { Button } from "@/components/ui/button";
import { FaRegCircleCheck } from "react-icons/fa6";

type Props = {
	ticketId: string;
	onDone: () => void;
};

export default function TicketCreatedSuccess({ ticketId, onDone }: Props) {
	return (
		<div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
			<FaRegCircleCheck className="h-11 w-11 text-brand-greenAccent" />

			<p className="text-base font-medium text-brand-greenAccent">Ticket created #{ticketId}</p>

			<p className="font-inter text-sm font-medium text-brand-dark60">
				The issue has been successfully reported.
				<br />
				Our team will work quickly to resolve it.
			</p>

			<Button className="mt-2 h-11 w-full" variant={"filled"} onClick={onDone}>
				Done
			</Button>
		</div>
	);
}
