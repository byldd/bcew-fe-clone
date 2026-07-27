"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dateToUTCString, toDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { getAdjustedHours, timeDifference } from "../utils";
import { ILateEmployeeResponse } from "../types";
import TimeInput from "@/components/ui/time-input";
import { openErrorToast } from "@/components/toast";
import { OptionYesNo, TIME_VARIANCE_TYPE } from "@/utils/enums";
import { IDayTime } from "@/module/job/types";
import { useUpdateLatenessDayTime } from "../hooks/useLateness";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { AttendanceStatus } from "../../weekly-schedule-management/types/schedule-interface";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

interface HandleLateEntryModalProps {
	onClose: () => void;
	lateEmployeeDetails: ILateEmployeeResponse;

	handleSuccessfulLateEntryUpdate: (successMessage: string | React.ReactNode) => void;
}

const HandleLateEntryModal: React.FC<HandleLateEntryModalProps> = ({
	onClose,
	lateEmployeeDetails,
	handleSuccessfulLateEntryUpdate,
}) => {
	const { type, employeeDayTime } = lateEmployeeDetails;

	const updateMutation = useUpdateLatenessDayTime(employeeDayTime?.id);

	const hasLateStart = type === TIME_VARIANCE_TYPE.LATE_ARRIVAL || type === TIME_VARIANCE_TYPE.BOTH;

	const hasEarlyEnd = type === TIME_VARIANCE_TYPE.EARLY_LOGOUT || type === TIME_VARIANCE_TYPE.BOTH;
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	// -------------------- STATE --------------------
	const [overrideStart, setOverrideStart] = useState("");
	const [overrideEnd, setOverrideEnd] = useState("");

	const [useClaimedStart, setUseClaimedStart] = useState(false);
	const [useClaimedEnd, setUseClaimedEnd] = useState(false);

	const [useActualStart, setUseActualStart] = useState(false);
	const [useActualEnd, setUseActualEnd] = useState(false);

	const [lateAdminNote, setLateAdminNote] = useState(employeeDayTime?.lateAdminNote ?? "");
	const [earlyAdminNote, setEarlyAdminNote] = useState(employeeDayTime?.earlyOutAdminNote ?? "");

	// -------------------- SOURCE TIMES --------------------
	const rosterStart = lateEmployeeDetails.rosterStartTime ?? null;
	const actualStart = lateEmployeeDetails.loggedStartTime ?? null;

	const rosterEnd = lateEmployeeDetails.rosterEndTime ?? null;
	const actualEnd = lateEmployeeDetails.loggedEndTime ?? null;

	const safeFormat = (v: string | Date | null) => (v ? toFormattedDate(v, DATE_FORMAT.HH_MM_AA_PM) : "-");

	const safeAdjusted = (v: string | Date | null) => (v ? getAdjustedHours(v) : "-");

	// -------------------- SAVE --------------------
	const handleSave = () => {
		if (!employeeDayTime?.id) return;

		const payload: IDayTime = {};

		// ---------------- LATE ----------------
		if (hasLateStart && overrideStart) {
			const overrideStartUTC = dateToUTCString(overrideStart);
			const claimedStartUTC = employeeDayTime?.lateClaimedStartTime
				? dateToUTCString(employeeDayTime.lateClaimedStartTime)
				: null;
			payload.overrideStartTime = overrideStartUTC;

			payload.lateAdminNote = lateAdminNote;

			// STATUS DECISION
			if (employeeDayTime?.lateResponse === OptionYesNo.NO && claimedStartUTC) {
				payload.lateStatus =
					overrideStartUTC === claimedStartUTC ? AttendanceStatus.ACCEPTED : AttendanceStatus.REJECTED;
			}
		}

		// ---------------- EARLY ----------------
		if (hasEarlyEnd && overrideEnd) {
			const overrideEndUTC = dateToUTCString(overrideEnd);
			const claimedEndUTC = employeeDayTime?.earlyClaimedEndTime
				? dateToUTCString(employeeDayTime.earlyClaimedEndTime)
				: null;
			payload.overrideEndTime = overrideEndUTC;

			payload.earlyOutAdminNote = earlyAdminNote;

			// STATUS DECISION
			if (employeeDayTime?.earlyOutResponse === OptionYesNo.NO && claimedEndUTC) {
				payload.earlyOutStatus =
					overrideEndUTC === claimedEndUTC ? AttendanceStatus.ACCEPTED : AttendanceStatus.REJECTED;
			}
		}

		updateMutation.mutate(payload, {
			onSuccess: () => {
				handleSuccessfulLateEntryUpdate(
					<>
						Attendance reviewed for{" "}
						<span className="font-semibold text-brand-dark">{lateEmployeeDetails?.user?.name}</span>
					</>
				);
			},
			onError: (error) => openErrorToast({ error }),
		});
	};

	return (
		<div className="space-y-4">
			{/* ================= LATE ENTRY ================= */}
			{hasLateStart && (
				<>
					<h3 className="font-semibold text-brand-dark">{tTimeLogs.lateEntry}</h3>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.rosterStartTime}</p>
							<p className="font-semibold">{safeFormat(rosterStart)}</p>
						</div>

						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.actualFirstEvent}</p>
							<p className="font-semibold">{safeFormat(actualStart)}</p>
						</div>

						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.totalTimeDifference}</p>
							<p className="font-semibold">{timeDifference(actualStart, rosterStart)}</p>
						</div>

						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.adjustedHours}</p>
							<p className="font-semibold">{safeAdjusted(actualStart)}</p>
						</div>
					</div>

					{employeeDayTime?.lateEmployeeReason && (
						<div>
							<Label className="text-sm text-brand-dark60">{tTimeLogs.noteFromTechnician}</Label>
							<div className="rounded-md bg-gray-100 p-3 text-sm">{employeeDayTime.lateEmployeeReason}</div>
						</div>
					)}

					{employeeDayTime?.lateResponse === OptionYesNo.NO && employeeDayTime?.lateClaimedStartTime && (
						<div>
							<Label className="text-sm text-brand-dark60">Claimed Start Time</Label>
							<div className="rounded-md bg-yellow-50 p-2 text-sm font-medium">
								{toFormattedDate(employeeDayTime.lateClaimedStartTime, DATE_FORMAT.HH_MM_AA_PM)}
							</div>
						</div>
					)}

					<div className="space-y-1">
						<FormLabelRequired label={tTimeLogs.overrideStartTime} required className="text-brand-dark60" />
						<TimeInput
							value={overrideStart}
							date={employeeDayTime?.date ?? new Date()}
							onChange={(val) => {
								setOverrideStart(val);
								if (useClaimedStart) setUseClaimedStart(false);
								if (useActualStart) setUseActualStart(false);
							}}
							disabled={useClaimedStart || useActualStart}
						/>
					</div>

					{employeeDayTime?.lateResponse === OptionYesNo.NO && employeeDayTime?.lateClaimedStartTime && (
						<div className="mt-1 flex items-center gap-2">
							<input
								type="checkbox"
								checked={useClaimedStart}
								onChange={(e) => {
									const checked = e.target.checked;
									setUseClaimedStart(checked);

									if (checked) {
										setUseActualStart(false);
										setOverrideStart(dateToUTCString(employeeDayTime.lateClaimedStartTime as Date | string));
									} else {
										setOverrideStart("");
									}
								}}
								disabled={useClaimedEnd || useActualEnd}
							/>
							<span className="text-xs text-brand-dark60">Same as claimed by technician</span>
						</div>
					)}

					{actualStart && (
						<div className="mt-1 flex items-center gap-2">
							<input
								type="checkbox"
								checked={useActualStart}
								onChange={(e) => {
									const checked = e.target.checked;
									setUseActualStart(checked);

									if (checked) {
										setUseClaimedStart(false);
										setOverrideStart(dateToUTCString(actualStart));
									} else {
										setOverrideStart("");
									}
								}}
							/>
							<span className="text-xs text-brand-dark60">Same as GPS / actual time</span>
						</div>
					)}

					<div>
						<Label className="text-sm text-brand-dark60">{tTimeLogs.notesByAdmin}</Label>
						<div className="p-0.5">
							<Textarea
								placeholder="Write here"
								value={lateAdminNote}
								onChange={(e) => setLateAdminNote(e.target.value)}
							/>
						</div>
					</div>
				</>
			)}

			{/* ================= EARLY RELEASE ================= */}
			{hasEarlyEnd && (
				<>
					<h3 className="border-t pt-2 text-base font-medium text-brand-dark">{tTimeLogs.earlyRelease}</h3>

					<div className="grid grid-cols-2 gap-8">
						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.rosterEndTime}</p>
							<p className="font-semibold">{safeFormat(rosterEnd)}</p>
						</div>

						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.actualEndTime}</p>
							<p className="font-semibold">{safeFormat(actualEnd)}</p>
						</div>

						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.totalTimeDifference}</p>
							<p className="font-semibold">{timeDifference(actualEnd, rosterEnd)}</p>
						</div>

						<div>
							<p className="text-sm text-brand-dark60">{tTimeLogs.adjustedHours}</p>
							<p className="font-semibold">{safeAdjusted(actualEnd)}</p>
						</div>
					</div>

					{employeeDayTime?.earlyOutEmployeeReason && (
						<div>
							<Label className="text-sm text-brand-dark60">{tTimeLogs.noteFromTechnician}</Label>
							<div className="rounded-md bg-gray-100 p-3 text-sm">{employeeDayTime.earlyOutEmployeeReason}</div>
						</div>
					)}

					{employeeDayTime?.earlyOutResponse === OptionYesNo.NO && employeeDayTime?.earlyClaimedEndTime && (
						<div>
							<Label className="text-sm text-brand-dark60">Claimed End Time</Label>
							<div className="rounded-md bg-yellow-50 p-2 text-sm font-medium">
								{toFormattedDate(employeeDayTime.earlyClaimedEndTime, DATE_FORMAT.HH_MM_AA_PM)}
							</div>
						</div>
					)}

					<div className="space-y-1">
						<FormLabelRequired label="	Override End Time" required className="text-brand-dark60" />
						<TimeInput
							value={overrideEnd}
							date={employeeDayTime?.date ?? new Date()}
							onChange={(val) => {
								setOverrideEnd(val);
								if (useClaimedEnd) setUseClaimedEnd(false);
								if (useActualEnd) setUseActualEnd(false);
							}}
						/>
					</div>

					{employeeDayTime?.earlyOutResponse === OptionYesNo.NO && employeeDayTime?.earlyClaimedEndTime && (
						<div className="mt-1 flex items-center gap-2">
							<input
								type="checkbox"
								checked={useClaimedEnd}
								onChange={(e) => {
									const checked = e.target.checked;
									setUseClaimedEnd(checked);

									if (checked) {
										setUseActualEnd(false);
										setOverrideEnd(dateToUTCString(employeeDayTime.earlyClaimedEndTime as Date | string));
									} else {
										setOverrideEnd("");
									}
								}}
							/>
							<span className="text-xs text-brand-dark60">Same as claimed by technician</span>
						</div>
					)}

					{actualEnd && (
						<div className="mt-1 flex items-center gap-2">
							<input
								type="checkbox"
								checked={useActualEnd}
								onChange={(e) => {
									const checked = e.target.checked;
									setUseActualEnd(checked);

									if (checked) {
										setUseClaimedEnd(false);
										setOverrideEnd(dateToUTCString(actualEnd));
									} else {
										setOverrideEnd("");
									}
								}}
							/>
							<span className="text-xs text-brand-dark60">Same as GPS / actual time</span>
						</div>
					)}

					<div>
						<Label className="text-sm text-brand-dark60">{tTimeLogs.notesByAdmin}</Label>
						<div className="px-0.5">
							<Textarea
								placeholder={tCommon.typeHere}
								value={earlyAdminNote}
								onChange={(e) => setEarlyAdminNote(e.target.value)}
							/>
						</div>
					</div>
				</>
			)}

			{/* ================= ACTIONS ================= */}
			<div className="flex gap-3">
				<Button variant="outline" className="w-full" onClick={onClose} disabled={updateMutation.isPending}>
					{tCommon.cancel}
				</Button>

				<Button
					variant="filled"
					className="w-full"
					onClick={handleSave}
					loading={updateMutation.isPending}
					loadingText="Saving..."
					disabled={
						hasLateStart && hasEarlyEnd
							? !(
									overrideStart &&
									overrideEnd &&
									toDate(overrideStart) < toDate(overrideEnd) &&
									(!actualEnd || toDate(overrideStart) < toDate(actualEnd)) &&
									(!actualStart || toDate(overrideEnd) > toDate(actualStart))
								)
							: hasLateStart
								? !(overrideStart && (!actualEnd || toDate(overrideStart) < toDate(actualEnd)))
								: hasEarlyEnd
									? !(overrideEnd && (!actualStart || toDate(overrideEnd) > toDate(actualStart)))
									: true
					}
				>
					{tCommon.save}
				</Button>
			</div>
		</div>
	);
};

export default HandleLateEntryModal;
