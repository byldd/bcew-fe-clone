"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/selectField";
import { DatePicker } from "@/components/ui/date-picker";
import { dateToUTCString } from "@/lib/utils/date";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { useEmployees } from "@/module/employee/hooks/useEmployee";
import { useStartTemporaryCoverage } from "@/module/employee/hooks/useEmployeeOffboarding";
import { mockEmployeeOptions } from "../utils/mock-employee-options";
import { COVERAGE_REASON } from "@/module/employee/enums";
import { ITemporaryCoverageResponse } from "@/module/employee/types";

interface Props {
	employeeId: string;
	employeeName: string;
	onClose: () => void;
	onStartCoverage: (coverage: ITemporaryCoverageResponse) => void;
}

const reasonOptions = Object.values(COVERAGE_REASON).map((reason) => ({
	label: formatSnakeCase(reason),
	value: reason,
}));

const TemporaryCoverageModal = ({ employeeId, employeeName, onClose, onStartCoverage }: Props) => {
	const firstName = employeeName.split(" ")[0];

	const { data: employeesData } = useEmployees({ pageSize: 100 });

	const startCoverageMutation = useStartTemporaryCoverage(employeeId);

	const coveringEmployeeOptions = employeesData?.items?.length
		? employeesData.items
				.filter((employee) => employee.id !== employeeId)
				.map((employee) => ({ label: employee.memberName, value: employee.id }))
		: mockEmployeeOptions;

	const [coveringEmployeeId, setCoveringEmployeeId] = useState("");
	const [reason, setReason] = useState<COVERAGE_REASON | "">("");
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();

	const canSubmit = !!coveringEmployeeId && !!reason && !!startDate && !!endDate;

	const handleStartCoverage = () => {
		if (!canSubmit || !startDate || !endDate) return;

		const coveringEmployeeName =
			coveringEmployeeOptions.find((option) => option.value === coveringEmployeeId)?.label ?? coveringEmployeeId;

		const fallbackCoverage: ITemporaryCoverageResponse = {
			id: `${employeeId}-coverage`,
			employeeId,
			coveringEmployeeId,
			coveringEmployeeName,
			reason,
			startDate: dateToUTCString(startDate),
			endDate: dateToUTCString(endDate),
			isActive: true,
		};

		startCoverageMutation.mutate(
			{
				coveringEmployeeId,
				reason,
				startDate: dateToUTCString(startDate),
				endDate: dateToUTCString(endDate),
			},
			{
				onSuccess: (coverage) => onStartCoverage(coverage),
				onError: () => onStartCoverage(fallbackCoverage),
				onSettled: onClose,
			}
		);
	};

	return (
		<div className="space-y-4">
			<div className="rounded-[10px] border border-[#FDE68AE6] bg-[#FFFBEB] p-3 text-xs text-[#78350F]">
				Work remains assigned to {firstName}. The covering person can view {firstName}&apos;s tasks, pending approvals,
				schedule assignments, and perform permitted actions during the coverage period.
			</div>

			<div className="grid grid-cols-2 gap-4">
				<SelectField
					label="Covered by"
					placeholder="Select an employee"
					options={coveringEmployeeOptions}
					value={coveringEmployeeId}
					onValueChange={setCoveringEmployeeId}
				/>
				<SelectField
					label="Reason"
					placeholder="Select a reason"
					options={reasonOptions}
					value={reason}
					onValueChange={(value) => setReason(value as COVERAGE_REASON)}
				/>
				<div className="space-y-1">
					<Label className="inline-flex items-start font-inter text-sm font-normal text-brand-grey">From</Label>
					<DatePicker placeholder="MM/DD/YYYY" value={startDate} onChange={setStartDate} />
				</div>
				<div className="space-y-1">
					<Label className="inline-flex items-start font-inter text-sm font-normal text-brand-grey">
						To (expected return)
					</Label>
					<DatePicker placeholder="MM/DD/YYYY" value={endDate} onChange={setEndDate} />
				</div>
			</div>

			<div className="rounded-[10px] bg-brand-bgLightgrey p-3 text-xs text-brand-dark60">
				Coverage ends automatically on the return date. All work remains assigned to {firstName}. Any unfinished items
				stay with {firstName} — no manual transfer is required.
			</div>

			<div className="flex justify-end gap-2 pt-2">
				<Button type="button" variant="outline" className="flex-1" onClick={onClose}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					className="flex-1"
					disabled={!canSubmit}
					loading={startCoverageMutation.isPending}
					onClick={handleStartCoverage}
				>
					Start Coverage
				</Button>
			</div>
		</div>
	);
};

export default TemporaryCoverageModal;
