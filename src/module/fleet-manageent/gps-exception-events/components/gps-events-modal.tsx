import React from "react";
import { IGpsExceptionEventByUser } from "../types/gps-exception-event";
import { formatTicksToDuration, toFormattedDate } from "@/lib/utils/date";
import { Car, Clock, MapPin, Calendar, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DATE_FORMAT } from "@/types/date";
import { convertKmToMiles } from "@/utils/gps";

const GpsEventsModal = ({
	events,
	date,
	userName,
}: {
	onClose: () => void;
	events: IGpsExceptionEventByUser["events"];
	date: string;
	userName?: string;
}) => {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-3 rounded-[10px] bg-brand-bgLightgrey p-3">
				<div className="flex items-center gap-2">
					<User className="size-4 text-brand-dark50" />
					<span className="text-sm font-medium text-brand-dark">{userName || "Unknown"}</span>
				</div>
				<Separator orientation="vertical" className="h-4" />
				<div className="flex items-center gap-2">
					<Calendar className="size-4 text-brand-dark50" />
					<span className="text-sm text-brand-dark50">{toFormattedDate(date)}</span>
				</div>
				<span className="ml-auto rounded-full bg-brand-dark px-2.5 py-1 text-xs font-medium text-white">
					{events?.length} {events?.length === 1 ? "event" : "events"}
				</span>
			</div>

			<div className="flex flex-col gap-3">
				{events?.map((event, index) => {
					const duration = formatTicksToDuration(event?.DurationTicks ? Number(event?.DurationTicks) : undefined);
					const vehicleName = event?.device?.Name?.split("[")[0]?.trim() || "Unknown Vehicle";

					const eventStarTime = event?.ActiveFrom;
					const eventEndTime = event?.ActiveTo;

					return (
						<div key={event.id} className="rounded-[10px] border border-brand-silver bg-white p-4">
							<div className="mb-3 flex items-center gap-2">
								<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-bgLightgrey">
									<Car className="size-4 text-brand-dark50" />
								</div>
								<span className="text-sm font-semibold text-brand-dark">{vehicleName}</span>
								<span className="ml-auto text-xs text-brand-dark30">#{index + 1}</span>
							</div>

							<Separator className="mb-3" />

							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
								<div className="flex items-start gap-2">
									<MapPin className="mt-0.5 size-4 shrink-0 text-brand-dark50" />
									<div>
										<p className="text-xs text-brand-dark50">Distance</p>
										<p className="text-sm font-medium text-brand-dark">
											{convertKmToMiles(event?.Distance ?? 0)?.toFixed(2)} mi
										</p>
									</div>
								</div>
								<div className="flex items-start gap-2">
									<Clock className="mt-0.5 size-4 shrink-0 text-brand-dark50" />
									<div>
										<p className="text-xs text-brand-dark50">Time</p>
										{
											<p className="text-sm font-medium text-brand-dark">
												{eventStarTime && eventEndTime
													? `${toFormattedDate(eventStarTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(eventEndTime, DATE_FORMAT.HH_MM_AA_PM)}`
													: "--"}
											</p>
										}
									</div>
								</div>

								<div className="flex items-start gap-2">
									<Clock className="mt-0.5 size-4 shrink-0 text-brand-dark50" />
									<div>
										<p className="text-xs text-brand-dark50">Duration</p>
										<p className="text-sm font-medium text-brand-dark">{duration}</p>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default GpsEventsModal;
