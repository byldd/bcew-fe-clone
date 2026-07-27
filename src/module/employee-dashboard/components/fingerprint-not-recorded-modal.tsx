"use client";

import { Button } from "@/components/ui/button";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import FingerprintLeaveButton from "./fingerprint-leave-button";

interface FingerprintNotRecordedModalProps {
	date: string;
	onLeave: () => void;
	onWorking: () => void;
}

export default function FingerprintNotRecordedModal({ date, onLeave, onWorking }: FingerprintNotRecordedModalProps) {
	return (
		<div className="space-y-4">
			<p className="font-inter text-sm text-brand-dark60">
				We noticed that no fingerprint scan was recorded for you on{" "}
				{toFormattedDate(date, DATE_FORMAT.MM_SLASH_DD_YYYY)}. Were you on leave that day?
			</p>
			<div className="flex gap-3">
				<FingerprintLeaveButton date={date} onSuccess={onLeave} className="w-full px-2 text-xs sm:px-4 sm:text-sm" />
				<Button variant="filled" className="w-full px-2 text-xs sm:px-4 sm:text-sm" onClick={onWorking}>
					No, I was working.
				</Button>
			</div>
		</div>
	);
}
