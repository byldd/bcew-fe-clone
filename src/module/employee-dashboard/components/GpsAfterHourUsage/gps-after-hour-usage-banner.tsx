import { useModal } from "@/hooks/useModal";
import { useGPSAfterHourUsage } from "../../hooks/useGPSWorking";
import AfterHourGpsExplanation from "./after-hour-gps-explanation";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { IRoster } from "@/module/schedule-management/roster-time-configuration/types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";

export default function GpsAfterHourUsageBanner({ date, roster }: { date: string; roster: IRoster | undefined }) {
	const { data: gpsAfterHourUsage } = useGPSAfterHourUsage({ date });

	const { openModal, closeModal, Modal } = useModal();

	const events = gpsAfterHourUsage?.events;
	const holidayEvent = gpsAfterHourUsage?.holidayGpsEvent;

	const device = events?.[0]?.device;
	const event = events?.[0];
	const eventActive = event?.ActiveFrom || holidayEvent?.ActiveFrom;

	const truckNumber = device?.Name?.split("[")[0] || holidayEvent?.TruckNumber;

	const existingNote = gpsAfterHourUsage?.gpsAfterHourUsageNote?.note;

	const handleFix = () => {
		openModal({
			modalView: <AfterHourGpsExplanation date={date} onClose={closeModal} existingNote={existingNote} />,
			modalTitle: "GPS After Hour Usage",
		});
	};

	const rosterStartTime = roster?.extendedApprovedStartTime || roster?.dayStartTime;
	const rosterEndTime = roster?.extendedApprovedEndTime || roster?.dayEndTime;

	return (
		<>
			{event?.id && (
				<div className="cursor-pointer rounded-[8px] bg-brand-bgYellow p-2 text-brand-yellow800">
					<Modal />

					<Collapsible>
						<CollapsibleTrigger asChild>
							<div className="flex items-center justify-between px-2">
								<p className="text-sm font-medium">Truck used outside working hours</p>
								<div className="flex items-center gap-2">
									<p
										onClick={(e) => {
											e.preventDefault();
											handleFix();
										}}
										className="text-xs font-medium text-[#7A6113] underline"
									>
										{existingNote ? "Edit Explanation" : "Add Explanation"}
									</p>
									<ChevronDownIcon className="h-4 w-4 group-data-[state=open]:rotate-180" />
								</div>
							</div>
						</CollapsibleTrigger>
						<CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
							<div className="flex w-full flex-col items-start">
								{!holidayEvent ? (
									<p className="my-1 text-xs font-medium">
										{`${truckNumber} was active ${
											eventActive ? ` at ${toFormattedDate(eventActive, DATE_FORMAT.DATE_AND_TIME)} ` : ""
										}  outside your scheduled shift ${
											rosterStartTime && rosterEndTime
												? ` (${toFormattedDate(rosterStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(
														rosterEndTime,
														DATE_FORMAT.HH_MM_AA_PM
													)})`
												: ""
										}. Was this activity expected? Please add a short explanation if needed.
			`}
									</p>
								) : (
									<p className="my-1 text-xs font-medium">
										{`${truckNumber} was active ${
											eventActive ? ` at ${toFormattedDate(eventActive, DATE_FORMAT.DATE_AND_TIME)} ` : ""
										} on a holiday. Was this activity expected? Please add a short explanation if needed.
			`}
									</p>
								)}
							</div>
						</CollapsibleContent>
					</Collapsible>
				</div>
			)}

			{holidayEvent?.ActiveFrom && (
				<div className="cursor-pointer rounded-[8px] bg-brand-bgYellow p-2 text-brand-yellow800">
					<Modal />

					<Collapsible>
						<CollapsibleTrigger asChild>
							<div className="flex items-center justify-between px-2">
								<p className="text-sm font-medium">Truck used on holiday</p>
								<div className="flex items-center gap-2">
									<p
										onClick={(e) => {
											e.preventDefault();
											handleFix();
										}}
										className="text-xs font-medium text-[#7A6113] underline"
									>
										{existingNote ? "Edit Explanation" : "Add Explanation"}
									</p>
									<ChevronDownIcon className="h-4 w-4 group-data-[state=open]:rotate-180" />
								</div>
							</div>
						</CollapsibleTrigger>
						<CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
							<div className="flex w-full flex-col items-start">
								<p className="my-1 text-xs font-medium">
									{`${truckNumber} was active ${
										eventActive ? ` at ${toFormattedDate(eventActive, DATE_FORMAT.DATE_AND_TIME)} ` : ""
									} on a holiday. Was this activity expected? Please add a short explanation if needed.
			`}
								</p>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</div>
			)}
		</>
	);
}
