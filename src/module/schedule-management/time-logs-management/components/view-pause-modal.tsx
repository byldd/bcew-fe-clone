"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IEmployeePauseTime } from "../../weekly-schedule-management/types/schedule-interface";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export const ViewPauseModal = ({
	employeePauseTimes,
	gapBeetweenStops,
}: {
	employeePauseTimes: IEmployeePauseTime[];
	gapBeetweenStops: {
		jobNames: string;
		gap: string;
	}[];
}) => {
	const [open, setOpen] = useState(false);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	return (
		<Popover open={open}>
			<PopoverTrigger asChild onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
				<Button variant="link" size="sm">
					{tTimeLogs.viewPauses}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-max max-w-[min(360px,calc(100vw-2rem))] text-sm">
				<p>{tTimeLogs.pauseBetweenStops}</p>

				{gapBeetweenStops.map((gap, index) => {
					return (
						<div key={index}>
							<p className="mb-1 text-xs font-medium text-muted-foreground">
								{gap.jobNames}
								{" - "}
								<span key={index} className="text-xs font-medium text-black">
									{`${gap.gap}`}
								</span>
							</p>
						</div>
					);
				})}

				<p>{tTimeLogs.pauseWithinStops}</p>
				{employeePauseTimes.map((pause, index) => {
					return (
						<div key={index}>
							<p className="mb-1 text-xs font-medium text-muted-foreground">
								{tTimeLogs.pause} {index + 1}
							</p>
							<p key={index} className="text-xs font-medium">
								{`${toFormattedDate(pause.pauseStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(pause.pauseEndTime, DATE_FORMAT.HH_MM_AA_PM)}`}
							</p>
						</div>
					);
				})}
			</PopoverContent>
		</Popover>
	);
};
