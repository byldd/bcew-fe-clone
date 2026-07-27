"use client";

import { useState, useMemo } from "react";
import { SelectField } from "@/components/ui/selectField";
import TimeInput from "@/components/ui/time-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dateToUTCString, getTodayDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { getAdjustedHours, timeDifference } from "../utils";
import { useCreateLateEntry, useEmployeesWithDayTime } from "../hooks/useLateness";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface Props {
	closeModal: () => void;
}

const CreateLateStartForm = ({ closeModal }: Props) => {
	const today = getTodayDate();
	const todayUTC = dateToUTCString(today);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const { data: employees } = useEmployeesWithDayTime({ date: todayUTC });

	const [employeeId, setEmployeeId] = useState("");
	const [actualStart, setActualStart] = useState<string | null>(null);
	const [notes, setNotes] = useState("");

	const queryClient = useQueryClient();
	const createLateEntry = useCreateLateEntry();

	const selectedEmployee = employees?.find((emp) => emp?.id === employeeId) ?? null;

	const rosterStart = selectedEmployee?.roster
		? selectedEmployee?.roster?.extendedApprovedStartTime || selectedEmployee?.roster?.dayStartTime
		: null;

	const timeDiff = useMemo(() => {
		return timeDifference(actualStart, rosterStart);
	}, [actualStart, rosterStart]);

	const adjustedHours = useMemo(() => {
		if (!actualStart) return "--";
		return getAdjustedHours(actualStart);
	}, [actualStart]);

	const handleCreate = () => {
		if (!employeeId || !actualStart) return;

		createLateEntry.mutate(
			{
				employeeId,
				dayStartTime: actualStart,
				date: todayUTC,
				lateAdminNote: notes,
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
			<SelectField
				label={tTimeLogs.selectEmployee}
				placeholder={tTimeLogs.selectEmployee}
				value={employeeId}
				onValueChange={setEmployeeId}
				options={
					employees?.map((emp) => ({
						label: emp.user?.name ?? "",
						value: emp.id,
						disabled: emp.hasTodayDayTimeEntry,
					})) ?? []
				}
			/>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-1">
					<p className="text-sm text-brand-dark60">{tTimeLogs.rosterStartTime}</p>
					<p className="font-semibold">{rosterStart ? toFormattedDate(rosterStart, DATE_FORMAT.HH_MM_AA_PM) : "--"}</p>
				</div>

				<div className="space-y-1">
					<p className="text-sm text-brand-dark60">{tTimeLogs.actualFirstEvent}</p>
					<TimeInput value={actualStart ?? undefined} date={today} onChange={setActualStart} />
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-1">
					<p className="text-sm text-brand-dark60">{tTimeLogs.totalTimeDifference}</p>
					<p className="font-semibold">{timeDiff}</p>
				</div>

				<div className="space-y-1">
					<p className="text-sm text-brand-dark60">{tTimeLogs.adjustedHours}</p>
					<p className="font-semibold">{adjustedHours}</p>
				</div>
			</div>
			<div className="px-0.5">
				<Textarea placeholder={tCommon.typeHere} value={notes} onChange={(e) => setNotes(e.target.value)} />
			</div>

			<div className="flex gap-3">
				<Button variant="outline" className="h-11 w-full" onClick={closeModal}>
					{tCommon.cancel}
				</Button>
				<Button className="h-11 w-full" variant="filled" onClick={handleCreate} disabled={!employeeId || !actualStart}>
					{tTimeLogs.create}
				</Button>
			</div>
		</div>
	);
};

export default CreateLateStartForm;
