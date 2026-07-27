"use client";

import { ColumnDef } from "@tanstack/react-table";
import { getAdjustedHours } from ".";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ILateEmployeeResponse } from "../types";
import { TIME_VARIANCE_TYPE } from "@/utils/enums";
import { useModal } from "@/hooks/useModal";
import HandleLateEntryModal from "../components/edit-late-entry-modal";
import { useQueryClient } from "@tanstack/react-query";
import SuccessModal from "@/components/success-modal";
import { FiEdit } from "react-icons/fi";
import { ViewLatenessNotes } from "../components/lateness-notes";
import { VARIANCE_LABEL_MAP } from "../../roster-time-configuration/constants";
import { ReactNode } from "react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const useLatenssColumns = () => {
	const latenessColumns: ColumnDef<ILateEmployeeResponse>[] = [
		{
			header: "Employee Name",
			cell: ({ row }) => (
				<span id={`${row?.original?.user?.employee?.id}`} className="font-medium">
					{row?.original?.user?.name}
				</span>
			),
		},
		{
			header: "Type",
			cell: ({ row }) => {
				const varianceType = row?.original?.type;

				const varianceLabel = varianceType ? VARIANCE_LABEL_MAP[varianceType] : undefined;

				return <span className="font-medium">{varianceLabel ?? "--"}</span>;
			},
		},
		{
			header: "Roster Start",
			cell: ({ row }) => {
				const v = row.original.rosterStartTime;
				return v ? toFormattedDate(v, DATE_FORMAT.HH_MM_AA_PM) : "-";
			},
		},

		{
			header: "Actual Start",
			cell: ({ row }) => {
				const { type, loggedStartTime } = row.original;

				const startTime = row.original?.employeeDayTime?.rawStartTime || loggedStartTime;

				if (type === TIME_VARIANCE_TYPE.LATE_ARRIVAL || type === TIME_VARIANCE_TYPE.BOTH) {
					return startTime ? toFormattedDate(startTime, DATE_FORMAT.HH_MM_AA_PM) : "-";
				}

				return "-";
			},
		},

		{
			header: "Adjusted Start",
			cell: ({ row }) => {
				const { type, loggedStartTime } = row.original;

				if (type === TIME_VARIANCE_TYPE.LATE_ARRIVAL || type === TIME_VARIANCE_TYPE.BOTH) {
					return loggedStartTime ? getAdjustedHours(loggedStartTime) : "-";
				}

				return "-";
			},
		},

		{
			header: "Roster End",
			cell: ({ row }) => {
				const v = row.original.rosterEndTime;
				return v ? toFormattedDate(v, DATE_FORMAT.HH_MM_AA_PM) : "-";
			},
		},

		{
			header: "Actual End",
			cell: ({ row }) => {
				const { type, loggedEndTime } = row.original;

				const endTime = row.original?.employeeDayTime?.rawEndTime || loggedEndTime;

				if (type === TIME_VARIANCE_TYPE.EARLY_LOGOUT || type === TIME_VARIANCE_TYPE.BOTH) {
					return endTime ? toFormattedDate(endTime, DATE_FORMAT.HH_MM_AA_PM) : "-";
				}

				return "-";
			},
		},

		{
			header: "Adjusted End",
			cell: ({ row }) => {
				const { type, loggedEndTime } = row.original;

				if (type === TIME_VARIANCE_TYPE.EARLY_LOGOUT || type === TIME_VARIANCE_TYPE.BOTH) {
					return loggedEndTime ? getAdjustedHours(loggedEndTime) : "-";
				}

				return "-";
			},
		},

		{
			header: "Status",
			cell: ({ row }) => {
				const { type, employeeDayTime } = row.original;

				if (!employeeDayTime) {
					return <span className="font-medium">—</span>;
				}

				const hasLate = type === TIME_VARIANCE_TYPE.LATE_ARRIVAL || type === TIME_VARIANCE_TYPE.BOTH;

				const hasEarly = type === TIME_VARIANCE_TYPE.EARLY_LOGOUT || type === TIME_VARIANCE_TYPE.BOTH;

				const lateHandled = !hasLate || employeeDayTime.isLatenessHandled === true;

				const earlyHandled = !hasEarly || employeeDayTime.isEarlyOutHandled === true;

				if (lateHandled && earlyHandled) {
					return <span className="font-medium">Handled</span>;
				}

				const lateResponsePending = hasLate && employeeDayTime.lateResponse === null;

				const earlyResponsePending = hasEarly && employeeDayTime.earlyOutResponse === null;

				if (lateResponsePending || earlyResponsePending) {
					return <span className="font-medium">Pending employee response</span>;
				}

				return <span className="font-medium">Admin review needed</span>;
			},
		},

		{
			header: "Notes",
			cell: ({ row }) => {
				const { type, employeeDayTime } = row.original;

				if (!employeeDayTime) return "—";

				const hasLate = type === TIME_VARIANCE_TYPE.LATE_ARRIVAL || type === TIME_VARIANCE_TYPE.BOTH;

				const hasEarly = type === TIME_VARIANCE_TYPE.EARLY_LOGOUT || type === TIME_VARIANCE_TYPE.BOTH;

				return (
					<ViewLatenessNotes
						lateEmployeeNote={hasLate ? employeeDayTime.lateEmployeeReason : null}
						lateAdminNote={hasLate ? employeeDayTime.lateAdminNote : null}
						earlyEmployeeNote={hasEarly ? employeeDayTime.earlyOutEmployeeReason : null}
						earlyAdminNote={hasEarly ? employeeDayTime.earlyOutAdminNote : null}
					/>
				);
			},
		},

		{
			header: "Action",
			cell: ({ row }) => <ActionCell lateEmployeeDetails={row.original} />,
		},
	];
	return latenessColumns;
};

interface ActionCellProps {
	lateEmployeeDetails: ILateEmployeeResponse;
}

const ActionCell: React.FC<ActionCellProps> = ({ lateEmployeeDetails }) => {
	const { openModal, closeModal, Modal } = useModal();
	const queryClient = useQueryClient();

	const { type } = lateEmployeeDetails;
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const hasLateStart = type === TIME_VARIANCE_TYPE.LATE_ARRIVAL || type === TIME_VARIANCE_TYPE.BOTH;

	const hasEarlyEnd = type === TIME_VARIANCE_TYPE.EARLY_LOGOUT || type === TIME_VARIANCE_TYPE.BOTH;

	const editModalHeading =
		hasLateStart && hasEarlyEnd
			? tTimeLogs.editEntry
			: hasLateStart
				? tTimeLogs.editLateEntry
				: hasEarlyEnd
					? tTimeLogs.editEarlyRelease
					: "";

	/**
	 * Handles success messages for:
	 * - LATE_ARRIVAL (start override)
	 * - EARLY_LOGOUT (end override)
	 * - BOTH (start + end overrides)
	 */
	const handleSuccessfulLateEntryUpdate = (successMessage: string | ReactNode) => {
		openModal({
			modalView: (
				<SuccessModal
					closeModal={() => {
						closeModal();
						queryClient.invalidateQueries({ queryKey: ["late-employees"] });
					}}
					description={successMessage}
					buttonText="Okay"
				/>
			),
		});
	};

	const openEdit = () => {
		openModal({
			modalTitle: <span>{editModalHeading}</span>,
			modalView: (
				<HandleLateEntryModal
					onClose={closeModal}
					lateEmployeeDetails={lateEmployeeDetails}
					handleSuccessfulLateEntryUpdate={handleSuccessfulLateEntryUpdate}
				/>
			),
			variant: "medium",
		});
	};

	return (
		<>
			<Modal />
			<button className="text-brand-dark hover:opacity-70">
				<FiEdit size={16} onClick={openEdit} />
			</button>
		</>
	);
};
