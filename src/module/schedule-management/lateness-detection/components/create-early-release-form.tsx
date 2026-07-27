"use client";

import { useState, useMemo } from "react";
import { SelectField } from "@/components/ui/selectField";
import TimeInput from "@/components/ui/time-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dateToUTCString, getTodayDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { getAdjustedHours, timeDifference } from "../utils";
import { useCreateEarlyReleaseEntry, useEmployeesWithDayTime } from "../hooks/useLateness";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface Props {
	closeModal: () => void;
}

const CreateEarlyReleaseForm = ({ closeModal }: Props) => {
	const today = getTodayDate();
	const todayUTC = dateToUTCString(today);

	const { data: employees } = useEmployeesWithDayTime({ date: todayUTC });

	const [employeeId, setEmployeeId] = useState("");
	const [actualEnd, setActualEnd] = useState<string | null>(null);
	const [notes, setNotes] = useState("");
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const queryClient = useQueryClient();
	const createEntry = useCreateEarlyReleaseEntry();

	const selectedEmployee = employees?.find((e) => e.id === employeeId) ?? null;

	// START TIME VALIDATION
	const hasDayStarted = useMemo(() => {
		if (!selectedEmployee) return false;

		const dayTime = selectedEmployee?.employeeDayTime;

		return Boolean(dayTime?.overrideStartTime || dayTime?.dayStartTime);
	}, [selectedEmployee]);

	// ROSTER END
	const rosterEnd = selectedEmployee?.roster
		? selectedEmployee.roster.extendedApprovedEndTime || selectedEmployee.roster.dayEndTime
		: null;

	// DERIVED VALUES
	const timeDiff = useMemo(() => {
		return timeDifference(actualEnd, rosterEnd);
	}, [actualEnd, rosterEnd]);

	const adjustedHours = useMemo(() => {
		if (!actualEnd) return "--";
		return getAdjustedHours(actualEnd);
	}, [actualEnd]);

	// SUBMIT
	const handleCreate = () => {
		if (!employeeId || !actualEnd || !hasDayStarted) return;

		createEntry.mutate(
			{
				employeeId,
				dayEndTime: actualEnd,
				date: todayUTC,
				earlyOutAdminNote: notes || undefined,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["late-employees"] });
					closeModal();
				},
				onError: (error) => openErrorToast({ error }),
			}
		);
	};

	return (
		<div className="space-y-6">
			{/* Employee */}
			<SelectField
				label={tTimeLogs.selectEmployee}
				placeholder={tTimeLogs.selectEmployee}
				value={employeeId}
				onValueChange={setEmployeeId}
				options={
					employees?.map((e) => ({
						label: e.user?.name ?? "Unknown",
						value: e.id,
					})) ?? []
				}
			/>

			{/* Warning */}
			{employeeId && !hasDayStarted && (
				<p className="text-sm text-red-500">{tTimeLogs.employeeHasNotStartedDayEarlyQuitCannotBeCreated}</p>
			)}

			{/* Roster End */}
			<div>
				<p className="text-sm text-brand-dark60">{tTimeLogs.rosterEndTime}</p>
				<p className="font-semibold">{rosterEnd ? toFormattedDate(rosterEnd, DATE_FORMAT.HH_MM_AA_PM) : "--"}</p>
			</div>

			{/* Actual End */}
			<div>
				<p className="text-sm text-brand-dark60">{tTimeLogs.actualEndTime}</p>
				<TimeInput value={actualEnd ?? undefined} date={today} onChange={setActualEnd} />
			</div>

			{/* Diff + Adjusted */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<p className="text-sm text-brand-dark60">{tTimeLogs.timeDifference}</p>
					<p className="font-semibold">{timeDiff}</p>
				</div>

				<div>
					<p className="text-sm text-brand-dark60">{tTimeLogs.adjustedHours}</p>
					<p className="font-semibold">{adjustedHours}</p>
				</div>
			</div>

			{/* Notes */}
			<Textarea placeholder={tCommon.typeHere} value={notes} onChange={(e) => setNotes(e.target.value)} />

			{/* Buttons */}
			<div className="flex gap-3">
				<Button variant="outline" className="w-full" onClick={closeModal}>
					{tCommon.cancel}
				</Button>

				<Button
					className="w-full"
					variant="filled"
					onClick={handleCreate}
					disabled={!employeeId || !actualEnd || !hasDayStarted}
				>
					{tTimeLogs.create}
				</Button>
			</div>
		</div>
	);
};

export default CreateEarlyReleaseForm;
