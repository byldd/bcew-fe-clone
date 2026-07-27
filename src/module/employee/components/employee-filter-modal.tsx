import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/selectField";
import { useEmployeeParams } from "../hooks/useEmployeeParams";
import { useRoles } from "../hooks/useRolesAndPermissions";
import { useDepartment } from "@/module/crew/hooks/useCrew";
import { openErrorToast } from "@/components/toast";
import { dateToUTCString } from "@/lib/utils/date";
import { EMPYEE_STATUS_FILTER } from "../types";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface FilterModalProps {
	onClose: () => void;
}

export default function EmployeeFilterModal({ onClose }: FilterModalProps) {
	const { getParams, setParams } = useEmployeeParams();
	const { department: defaultDept, jobRole: defaultRole, startDate, endDate, status: paramsStatus } = getParams();

	const { data: roles } = useRoles();
	const { data: departments } = useDepartment();

	const [department, setDepartment] = useState(defaultDept);
	const [jobRole, setJobRole] = useState(defaultRole);
	const [start, setStartDate] = useState(startDate ? new Date(startDate) : undefined);
	const [end, setEndDate] = useState(endDate ? new Date(endDate) : undefined);
	const [status, setStatus] = useState<EMPYEE_STATUS_FILTER>(paramsStatus);
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const handleApply = () => {
		if (start && end && start > end) {
			openErrorToast({ message: tPmanagement.startDateMustBeEarlierThanEndDate });
			return;
		}

		setParams({
			department,
			jobRole,
			startDate: start ? dateToUTCString(start) : undefined,
			endDate: end ? dateToUTCString(end) : undefined,
			status,
		});
		onClose();
	};

	const handleClearAll = () => {
		setDepartment("");
		setJobRole("");
		setStartDate(undefined);
		setEndDate(undefined);
		setParams({
			department: "",
			jobRole: "",
			startDate: "",
			endDate: "",
			status: EMPYEE_STATUS_FILTER.ACTIVE,
		});
		onClose();
	};

	return (
		<div className="space-y-6">
			{/* Status */}
			<div className="space-y-1">
				<Label htmlFor="status" className="text-sm text-brand-dark60">
					{tPmanagement.status}
				</Label>
				<SelectField
					id="status"
					placeholder={tPmanagement.selectStatus}
					value={status}
					options={
						Object.values(EMPYEE_STATUS_FILTER)?.map((stat) => ({
							label: formatSnakeCase(stat),
							value: stat,
						})) ?? []
					}
					onValueChange={(val) => setStatus(val as EMPYEE_STATUS_FILTER)}
				/>
			</div>

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
							value: dept.dptnme,
						})) ?? []
					}
					onValueChange={(val) => setDepartment(val)}
				/>
			</div>

			{/* PTO Date Range */}
			<div className="space-y-1">
				<Label className="text-sm text-brand-dark60">{tPmanagement.ptoDateRange}</Label>
				<div className="grid grid-cols-2 gap-3">
					<DatePicker value={start} onChange={setStartDate} />
					<DatePicker value={end} onChange={setEndDate} />
				</div>
			</div>

			{/* Job Role */}
			<div className="space-y-1">
				<Label htmlFor="jobRole" className="text-sm text-brand-dark60">
					{tPmanagement.jobRole}
				</Label>
				<SelectField
					id="jobRole"
					placeholder={tPmanagement.selectJobRole}
					value={jobRole}
					options={
						roles?.map((role) => ({
							label: role.name,
							value: role.id,
						})) ?? []
					}
					onValueChange={(val) => setJobRole(val)}
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
