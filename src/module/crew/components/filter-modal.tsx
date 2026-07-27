import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/selectField";
import { useState } from "react";
import { useCrewParams } from "@/module/crew/hooks/useCrewParams";
import { useCrewLeaders, useDepartment } from "../hooks/useCrew";
import { openErrorToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface FilterModalProps {
	onClose: () => void;
}

export default function FilterModal({ onClose }: FilterModalProps) {
	const { getParams, setParams } = useCrewParams();
	const { department: defaultDept, crewLeader: defaultCrewLeader, startDate, endDate } = getParams();

	const { data: departments } = useDepartment();
	const { data: crewLeaders } = useCrewLeaders();

	const [department, setDepartment] = useState(defaultDept || "");
	const [crewLeader, setCrewLeader] = useState(defaultCrewLeader || "");
	const [start, setStartDate] = useState(startDate ? new Date(startDate) : undefined);
	const [end, setEndDate] = useState(endDate ? new Date(endDate) : undefined);
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const handleApply = () => {
		if (start && end && start > end) {
			openErrorToast({ message: tPmanagement.startDateMustBeEarlierThanEndDate });
			return;
		}
		setParams({
			department,
			crewLeader,
			startDate: start ? start.toISOString() : undefined,
			endDate: end ? end.toISOString() : undefined,
		});
		onClose();
	};

	const handleClearAll = () => {
		setDepartment("");
		setCrewLeader("");
		setStartDate(undefined);
		setEndDate(undefined);
		setParams({
			department: "",
			crewLeader: "",
			startDate: "",
			endDate: "",
		});
		onClose();
	};

	return (
		<div className="space-y-6">
			{/* Department */}
			<div className="space-y-1">
				<Label htmlFor="department" className="text-sm text-brand-dark60">
					{tPmanagement.department}
				</Label>
				<SelectField
					id="department"
					placeholder={tPmanagement.selectDepartment}
					value={department}
					options={
						departments?.map((dept) => ({
							label: dept.dptnme,
							value: dept.idnum,
						})) ?? []
					}
					onValueChange={(val) => setDepartment(val)}
				/>
			</div>

			{/* Date Range */}
			<div className="space-y-1">
				<Label className="text-sm text-brand-dark60">{tPmanagement.selectDateRange}</Label>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="min-w-0">
						<DatePicker value={start} onChange={setStartDate} />
					</div>
					<div className="min-w-0">
						<DatePicker value={end} onChange={setEndDate} />
					</div>
				</div>
			</div>

			{/* Crew Leader */}
			<div className="space-y-1">
				<Label htmlFor="crewLeader" className="text-sm text-brand-dark60">
					{tPmanagement.crewLeader}
				</Label>
				<SelectField
					id="crewLeader"
					placeholder={tPmanagement.selectCrewLeader}
					value={crewLeader}
					options={
						crewLeaders?.map((crewLeader) => ({
							label: crewLeader.employeeName,
							value: crewLeader.employeeId,
						})) ?? []
					}
					onValueChange={(val) => setCrewLeader(val)}
				/>
			</div>

			{/* Actions */}
			<div className="flex justify-between gap-2">
				<Button onClick={handleClearAll} variant="outline" className="w-full">
					{tPmanagement.clearAll}
				</Button>
				<Button onClick={handleApply} variant="filled" className="w-full">
					{tPmanagement.apply}
				</Button>
			</div>
		</div>
	);
}
