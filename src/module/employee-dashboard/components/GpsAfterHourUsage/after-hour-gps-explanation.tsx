import { TextareaField } from "@/components/ui/textareaField";
import React, { useState } from "react";
import { useAddGPSAfterHourUsageExplanation } from "../../hooks/useGPSWorking";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const AfterHourGpsExplanation = ({
	date,
	onClose,
	existingNote,
}: {
	date: string;
	onClose: () => void;
	existingNote?: string;
}) => {
	const [reason, setReason] = useState(existingNote || "");

	const { mutateAsync: addGPSAfterHourUsageExplanation, isPending } = useAddGPSAfterHourUsageExplanation();

	const queryClient = useQueryClient();

	const handleSave = async () => {
		await addGPSAfterHourUsageExplanation(
			{ explanation: reason, date },
			{
				onSuccess: () => {
					openSuccessToast(" GPS after hour usage explanation added successfully");
					onClose();
					queryClient.invalidateQueries({ queryKey: ["gps-after-hour-usage", date] });
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div>
			<div className="my-2 p-1">
				<TextareaField
					placeholder="Enter your explanation"
					value={reason}
					onChange={(e) => setReason(e.target.value)}
				/>
			</div>
			<Button className="w-full" variant={"filled"} onClick={handleSave} disabled={isPending || !reason.trim()}>
				Submit
			</Button>
		</div>
	);
};

export default AfterHourGpsExplanation;
