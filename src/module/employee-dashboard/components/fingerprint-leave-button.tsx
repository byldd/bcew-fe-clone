"use client";

import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useFingerprintLeave } from "../hooks/useFingerprintActionRequest";
import useAuthStore from "@/store/auth-store";

interface FingerprintLeaveButtonProps {
	date: string;
	onSuccess: () => void;
	className?: string;
}

export default function FingerprintLeaveButton({ date, onSuccess, className }: FingerprintLeaveButtonProps) {
	const { mutate: markLeave, isPending } = useFingerprintLeave();

	const handleLeave = () => {
		markLeave(
			{ date },
			{
				onSuccess: () => {
					openSuccessToast("Marked as leave successfully.");
					onSuccess();
				},
				onError: () => {
					openErrorToast({ message: "Failed to mark leave. Please try again." });
				},
			}
		);
	};

	return (
		<Button variant="outline" className={className ?? "w-full"} onClick={handleLeave} disabled={isPending}>
			Yes, I was on leave.
		</Button>
	);
}
