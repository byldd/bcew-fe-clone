import { ColumnDef, createColumnHelper, Row } from "@tanstack/react-table";
import { IGpsExceptionEventByUser } from "../types/gps-exception-event";
import {
	changeTimeZone,
	dateToUTCString,
	formatTicksToDuration,
	isSameDate,
	toFormattedDate,
	toMidnightDateString,
} from "@/lib/utils/date";
import { addDays } from "date-fns";
import { DATE_FORMAT } from "@/types/date";
import ExplanationPopover from "../components/explanation-popover";
import { useModal } from "@/hooks/useModal";
import GpsEventsModal from "../components/gps-events-modal";
import { Car, Clock, MapPin } from "lucide-react";
import { convertKmToMiles } from "@/utils/gps";
import { TIMEZONE } from "@/utils/enums";

const columnHelper = createColumnHelper<IGpsExceptionEventByUser>();

export const getGpsExceptionEventsColumns = ({ weekStart, weekEnd }: { weekStart: Date; weekEnd: Date }) => {
	const dates = [];

	let i = weekStart;
	while (dates.length <= 7 && i <= weekEnd) {
		dates.push(i);
		i = addDays(i, 1);
	}

	const columns: ColumnDef<IGpsExceptionEventByUser>[] = [
		{
			header: "Employee Name",
			cell: ({ row }) => {
				const name = `${row.original?.userName}`;
				return <div>{name || "Unknown Driver"}</div>;
			},
		},
		...dates.map((columnDate) =>
			columnHelper.display({
				id: columnDate.toISOString(),

				header: () => (
					<div className="flex flex-col items-center text-sm font-semibold leading-tight text-brand-dark50">
						<span>{toFormattedDate(columnDate, DATE_FORMAT.WEEK_DAY)}</span>
						<span>{toFormattedDate(columnDate)}</span>
					</div>
				),

				cell: ({ row }: { row: Row<IGpsExceptionEventByUser> }) => {
					return <GPsEventBlock eventData={row.original} date={dateToUTCString(columnDate)} />;
				},
			})
		),
	];

	return columns;
};

const GPsEventBlock = ({ eventData, date }: { eventData: IGpsExceptionEventByUser; date: string }) => {
	const gpsExceptionEvent = eventData?.events?.filter((event) => {
		if (!event?.ActiveFrom) return false;

		return isSameDate(toMidnightDateString(event?.ActiveFrom), date);
	});

	const { closeModal, openModal, Modal } = useModal();

	if (gpsExceptionEvent?.length === 0) {
		return "--";
	}

	const firstEvent = gpsExceptionEvent[0];
	const duration = formatTicksToDuration(firstEvent?.DurationTicks ? Number(firstEvent?.DurationTicks) : undefined);

	const onSeeMore = () => {
		openModal({
			modalTitle: "GPS Exception Events",
			modalView: (
				<GpsEventsModal userName={eventData.userName} events={gpsExceptionEvent} onClose={closeModal} date={date} />
			),
		});
	};

	const vehicleName = firstEvent?.device?.Name?.split("[")[0]?.trim() || "Unknown";
	const eventStarTime = firstEvent?.ActiveFrom;
	const eventEndTime = firstEvent?.ActiveTo;
	const distance = firstEvent?.Distance;

	return (
		<div id={firstEvent?.employee?.user?.id} className="flex flex-col gap-1.5">
			<Modal />

			<div className="flex items-center gap-1">
				<Car className="size-3 shrink-0 text-brand-dark50" />
				<span className="truncate text-xs font-medium text-brand-dark" title={vehicleName}>
					{vehicleName}
				</span>
			</div>

			<div className="flex flex-wrap gap-1">
				<span className="flex items-center gap-0.5 rounded-full bg-brand-bgLightgrey px-1.5 py-0.5 text-[8px] text-brand-dark50">
					<MapPin className="size-2.5" />
					{convertKmToMiles(distance ?? 0)?.toFixed(2)} mi
				</span>
				<span className="flex items-center gap-0.5 rounded-full bg-brand-bgLightgrey px-1.5 py-0.5 text-[8px] text-brand-dark50">
					<Clock className="size-2.5" />
					{duration}
				</span>

				<span className="flex items-center gap-0.5 rounded-full bg-brand-bgLightgrey px-1.5 py-0.5 text-[8px] text-brand-dark50">
					<Clock className="size-2.5" />
					{eventStarTime && eventEndTime
						? `${toFormattedDate(eventStarTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(eventEndTime, DATE_FORMAT.HH_MM_AA_PM)}`
						: "--"}
				</span>
			</div>

			<div className="text-xs">
				{gpsExceptionEvent?.length > 1 && (
					<p onClick={onSeeMore} className="cursor-pointer underline">
						+{gpsExceptionEvent.length - 1} more
					</p>
				)}
				<ExplanationPopover note={firstEvent?.gpsAfterHourUsageNote?.note || ""} />
			</div>
		</div>
	);
};
