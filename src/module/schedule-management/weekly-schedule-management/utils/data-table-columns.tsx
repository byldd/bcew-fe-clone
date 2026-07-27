import { ColumnDef } from "@tanstack/react-table";

import { IScheduleHistory } from "../../schedule-history/utils/schedule-history-type";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { Download } from "lucide-react";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const useScheduleColumns = (): ColumnDef<IScheduleHistory>[] => {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	return [
		{
			accessorKey: "dateRange",
			header: tschedule.scheduleDateRange,
			cell: ({ row }) => {
				return (
					<div>
						<p>
							{toFormattedDate(row.original.startDate, DATE_FORMAT.MM_SLASH_DD_YYYY)} -{" "}
							{toFormattedDate(row.original.endDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}
						</p>
					</div>
				);
			},
		},

		{
			accessorKey: "pdf",
			header: tschedule.downloadPdf,
			cell: ({ row }) => {
				return (
					<div className="flex items-center justify-center">
						<a href={row.original.fileUrl} target="_blank" className="border text-sm underline">
							<Download />
						</a>
					</div>
				);
			},
		},
	];
};

export { useScheduleColumns };
