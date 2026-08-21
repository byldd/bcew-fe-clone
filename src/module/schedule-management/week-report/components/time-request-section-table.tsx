import { IEmployeeExtendedTime } from "@/module/job/types";
import { IMiddayStopRequest } from "@/module/schedule-management/time-requests/utils/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { mapExtendedTimeRows, mapNewJobRequestRows } from "../utils/time-request-rows";
import { SectionTableHead, SectionTableCell, StatusBadge } from "./table-components";

const TimeRequestSectionTable = ({
	extendedTimes,
	newJobRequests,
}: {
	extendedTimes: IEmployeeExtendedTime[];
	newJobRequests: IMiddayStopRequest[];
}) => {
	const rows = [...mapExtendedTimeRows(extendedTimes), ...mapNewJobRequestRows(newJobRequests)].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	if (rows.length === 0) {
		return <p className="px-1 py-2 text-xs text-brand-dark50">No time requests</p>;
	}

	return (
		<table className="w-full min-w-max border-collapse">
			<thead>
				<tr className="bg-brand-bgLightgrey">
					<SectionTableHead>Date</SectionTableHead>
					<SectionTableHead>Request Type</SectionTableHead>
					<SectionTableHead>Requested / Time Taken</SectionTableHead>
					<SectionTableHead>Reason / Job Details</SectionTableHead>
					<SectionTableHead>Note</SectionTableHead>
					<SectionTableHead>Status</SectionTableHead>
				</tr>
			</thead>
			<tbody>
				{rows.map((row) => (
					<tr key={row.id}>
						<SectionTableCell>{toFormattedDate(row.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}</SectionTableCell>
						<SectionTableCell>{row.requestType}</SectionTableCell>
						<SectionTableCell>{row.timeInfo}</SectionTableCell>
						<SectionTableCell>{row.details}</SectionTableCell>
						<SectionTableCell>{row.note}</SectionTableCell>
						<SectionTableCell>
							<StatusBadge isApproved={row.isApproved} />
						</SectionTableCell>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default TimeRequestSectionTable;
