import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import React, { useState } from "react";
import { useCreatePayrollLog } from "../hooks/usePayrollLogs";
import { getBcewWeekRange, getTodayDate, toDate, toMidnightDateString } from "@/lib/utils/date";
import { Label } from "@/components/ui/label";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

const AddPayrollLog = () => {
	const { Modal, openModal, closeModal } = useModal();

	const onAddNewLogs = () => {
		openModal({
			modalView: <AddPayRollModal closeModal={closeModal} />,
			modalTitle: "Add New Payroll Log",
			variant: "medium",
		});
	};

	return (
		<WriteAccessWrapper>
			<Button onClick={onAddNewLogs} variant={"filled"}>
				Add New Payroll Log
			</Button>
			<Modal />
		</WriteAccessWrapper>
	);
};

export default AddPayrollLog;

const AddPayRollModal = ({ closeModal }: { closeModal: () => void }) => {
	const { mutate, isPending } = useCreatePayrollLog();

	const today = getTodayDate();
	const queryClient = useQueryClient();

	const [payrollDate, setPayrollDate] = useState<Date | undefined>(today);

	const { weekStart, weekEnd } = getBcewWeekRange(payrollDate);

	const handleCreatePayrollLog = () => {
		if (!payrollDate) return;

		mutate(
			{
				weekStartDate: toMidnightDateString(weekStart),
				weekEndDate: toMidnightDateString(weekEnd),
				date: toMidnightDateString(today),
			},
			{
				onSuccess: () => {
					openSuccessToast("Payroll log created successfully");
					closeModal();
					void queryClient.invalidateQueries({
						queryKey: ["payroll-weeks"],
					});
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="space-y-8">
			<div className="space-y-2">
				<Label className="text-sm text-brand-dark50">{"Select Payroll Date"}</Label>
				<DateRangePickModal
					startDate={weekStart}
					endDate={weekEnd}
					onChange={(startDate) => {
						setPayrollDate(startDate ? toDate(startDate) : undefined);
					}}
					selectApplyTo={DATE_PICK_APPLY_TO.END_DATE}
					onMoveBack={(startDate) => {
						setPayrollDate(startDate);
					}}
					onMoveForward={(startDate, endDate) => {
						setPayrollDate(endDate);
					}}
					dayRange={6}
				/>
			</div>

			<div className="flex gap-2">
				<Button className="w-full" variant={"outline"} onClick={closeModal}>
					Close
				</Button>
				<Button disabled={isPending} onClick={handleCreatePayrollLog} className="w-full" variant={"filled"}>
					Create
				</Button>
			</div>
		</div>
	);
};
