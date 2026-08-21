import { ITimeVarianceResult } from "@/module/schedule-management/time-variance/utils/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { SectionTableHead, SectionTableCell } from "./table-components";

const TimeVarianceSectionTable = ({ timeVariances }: { timeVariances: ITimeVarianceResult[] }) => {
	if (timeVariances.length === 0) {
		return <p className="px-1 py-2 text-xs text-brand-dark50">No time variance records</p>;
	}

	return (
		<table className="w-full min-w-max border-collapse">
			<thead>
				<tr className="bg-brand-bgLightgrey">
					<SectionTableHead>Date</SectionTableHead>
					<SectionTableHead>Roster Time</SectionTableHead>
					<SectionTableHead>Actual Time</SectionTableHead>
					<SectionTableHead>Pause Time</SectionTableHead>
				</tr>
			</thead>
			<tbody>
				{timeVariances.map((variance, index) => (
					<tr key={`${variance.empNum}-${index}`}>
						<SectionTableCell>{toFormattedDate(variance.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}</SectionTableCell>
						<SectionTableCell>
							<span className="text-brand-dark50">({variance.schHours} hrs)</span> {variance.schStartTime} -{" "}
							{variance.schEndTime}
						</SectionTableCell>
						<SectionTableCell>
							{variance.actStartTime && variance.actEndTime ? (
								<>
									<span className="text-brand-dark50">({variance.actHours} hrs)</span> {variance.actStartTime} -{" "}
									{variance.actEndTime}
								</>
							) : (
								"Not clocked"
							)}
						</SectionTableCell>
						<SectionTableCell>{variance.pauseTime ?? "-"}</SectionTableCell>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default TimeVarianceSectionTable;
