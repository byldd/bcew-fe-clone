"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/selectField";
import { DatePicker } from "@/components/ui/date-picker";
import { useAdminTechnicalIssuesParams } from "@/module/admin-technical-issues/hooks/use-admin-technical-issue-params";
import { useAppBugRoles } from "@/module/admin-technical-issues/hooks/useTechnicalIssues";
import { TECHNICAL_ISSUE_STATUS, TECHNICAL_ISSUE_ACTION_FILTER } from "@/utils/enums";
import { dateToUTCString, toDate } from "@/lib/utils/date";
import { openErrorToast } from "@/components/toast";
import { formatEnumLabel } from "@/lib/utils/value-formatter";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { TECHNICAL_ISSUE_ACTION_FILTER_LABEL_MAP } from "@/module/admin-technical-issues/constants";

type Props = {
	onClose: () => void;
};

export default function TechnicalIssuesFilter({ onClose }: Props) {
	const { getParams, setParams, clearParams } = useAdminTechnicalIssuesParams();
	const { role, status, action, startDate, endDate } = getParams();
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);

	const { data: roles } = useAppBugRoles();

	const handleApply = () => {
		if (startDate && endDate && startDate > endDate) {
			openErrorToast({ message: tAdmin.startDateMustBeBeforeEndDate });
			return;
		}

		onClose();
	};

	const handleClearAll = () => {
		clearParams();
		onClose();
	};

	return (
		<div className="space-y-6">
			{/* Role */}
			<div className="space-y-1">
				<Label className="font-normal text-brand-grey">{tAdmin.employeeRole}</Label>
				<SelectField
					placeholder={tAdmin.selectRole}
					value={role}
					options={
						roles?.map((r) => ({
							label: r.name,
							value: r.id,
						})) ?? []
					}
					onValueChange={(val) => setParams({ role: val || undefined })}
				/>
			</div>

			{/* Action */}
			<div className="space-y-1">
				<Label className="font-normal text-brand-grey">{tAdmin.action}</Label>
				<SelectField
					placeholder={tAdmin.selectAction}
					value={action}
					options={Object.values(TECHNICAL_ISSUE_ACTION_FILTER).map((a) => ({
						label: TECHNICAL_ISSUE_ACTION_FILTER_LABEL_MAP[a],
						value: a,
					}))}
					onValueChange={(val) => setParams({ action: val as TECHNICAL_ISSUE_ACTION_FILTER })}
				/>
			</div>

			{/* Status */}
			<div className="space-y-1">
				<Label className="font-normal text-brand-grey">{tAdmin.status}</Label>
				<SelectField
					placeholder={tAdmin.selectStatus}
					value={status}
					options={Object.values(TECHNICAL_ISSUE_STATUS).map((s) => ({
						label: formatEnumLabel(s),
						value: s,
					}))}
					onValueChange={(val) => setParams({ status: val as TECHNICAL_ISSUE_STATUS })}
				/>
			</div>

			{/* Date Range */}
			<div className="flex gap-4">
				<div className="w-1/2 space-y-1">
					<Label className="font-normal text-brand-grey">{tAdmin.startDate}</Label>
					<DatePicker
						value={startDate}
						onChange={(date) =>
							setParams({
								startDate: date ? dateToUTCString(toDate(date)) : undefined,
							})
						}
					/>
				</div>

				<div className="w-1/2 space-y-1">
					<Label className="font-normal text-brand-grey">{tAdmin.endDate}</Label>
					<DatePicker
						value={endDate}
						onChange={(date) =>
							setParams({
								endDate: date ? dateToUTCString(toDate(date)) : undefined,
							})
						}
					/>
				</div>
			</div>
			<div className="flex justify-between gap-2 pb-2 pt-6">
				<Button variant="outline" className="w-full" onClick={handleClearAll}>
					{tAdmin.reset}
				</Button>

				<Button variant="filled" className="w-full" onClick={handleApply}>
					{tAdmin.apply}
				</Button>
			</div>
		</div>
	);
}
