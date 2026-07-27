"use client";

import { Button } from "@/components/ui/button";

import { useEffect, useState } from "react";
import { useAssignSubContractorCrew } from "../../../sub-contractor/hooks/useSubContractorJobSchedule";
import { IWeekScheduleResponse } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import CreateSubContractorNewCrewTrigger from "@/module/sub-contractor-admin-desktop/crew-management/components/create-new-sub-contractor-crew-trigger";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { SelectField } from "@/components/ui/selectField";
import { useSubContractorScheduleContext } from "../context/schedule-context";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface AssignCrewDesktopModalProps {
	dailyJobWithEmployee?: IWeekScheduleResponse["dailyJobs"][number];
	closeModal: () => void;
}

export const AssignCrewDesktopModal: React.FC<AssignCrewDesktopModalProps> = ({ dailyJobWithEmployee, closeModal }) => {
	const { subContractorCrews } = useSubContractorScheduleContext();
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const [selectedCrew, setSelectedCrew] = useState<string | undefined>(dailyJobWithEmployee?.subcontractorCrew?.id);

	useEffect(() => {
		if (dailyJobWithEmployee?.subcontractorCrew?.id) {
			setSelectedCrew(dailyJobWithEmployee?.subcontractorCrew?.id);
		}
	}, [dailyJobWithEmployee]);

	const { mutate: assignCrewMutation, isPending } = useAssignSubContractorCrew();

	const queryClient = useQueryClient();

	const isJobTimeLogAvailable =
		dailyJobWithEmployee?.subContractorJobUpdate?.startTime && dailyJobWithEmployee?.subContractorJobUpdate?.endTime
			? true
			: false;

	const handleAssign = () => {
		if (!selectedCrew || !dailyJobWithEmployee?.id || isJobTimeLogAvailable) return;

		assignCrewMutation(
			{ crewId: selectedCrew, dailyJobId: dailyJobWithEmployee?.id },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["sub-contractor-week-schedule"],
					});
					openSuccessToast(tSub.crewAssignedSuccessfully);
					closeModal();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="space-y-6">
			{/* ───────── Assign To ───────── */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-brand-dark">{tSub.assignTo}</label>

				<SelectField
					options={subContractorCrews.map((crew) => ({ label: crew.name, value: crew.id }))}
					placeholder={tSub.selectAvailableCrew}
					value={selectedCrew}
					onValueChange={(value) => setSelectedCrew(value)}
				/>
			</div>

			{/* ───────── Create New Crew ───────── */}

			<CreateSubContractorNewCrewTrigger />

			{/* ───────── Footer Actions ───────── */}
			{isJobTimeLogAvailable ? (
				<p className="text-center text-sm text-red-500">
					{tSub.cannotAssignCrew} {dailyJobWithEmployee?.subcontractorCrew?.name} {tSub.crewAlreadyLoggedTime}
				</p>
			) : (
				<div className="pt-6">
					<Button
						variant="filled"
						loading={isPending}
						disabled={isPending || !selectedCrew}
						className="w-full"
						onClick={handleAssign}
					>
						{tSub.assignAndSave}
					</Button>
				</div>
			)}
		</div>
	);
};
