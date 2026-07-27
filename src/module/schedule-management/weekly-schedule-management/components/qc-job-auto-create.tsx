import { Button } from "@/components/ui/button";
import React from "react";
import { useScheduleParams } from "../hooks/useScheduleParams";
import { useCreateQcJobAutoAssign } from "../hooks/useSchedule";
import { toMidnightDateString } from "@/lib/utils/date";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";

const QCJobAutoCreate = () => {
	const { getParams } = useScheduleParams();
	const { startDate, endDate } = getParams();
	const { mutate: createQcJobAutoAssign, isPending } = useCreateQcJobAutoAssign();
	const queryClient = useQueryClient();

	const handleCreateQcJobAutoAssign = () => {
		createQcJobAutoAssign(
			{ startDate: toMidnightDateString(startDate), endDate: toMidnightDateString(endDate) },
			{
				onSuccess: () => {
					openSuccessToast("QC Job Auto-Assign created successfully.");
					void queryClient.invalidateQueries({ queryKey: ["week-schedule"] });
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div>
			<Button loading={isPending} variant="outline" onClick={handleCreateQcJobAutoAssign} disabled={isPending}>
				QC
			</Button>
		</div>
	);
};

export default QCJobAutoCreate;
