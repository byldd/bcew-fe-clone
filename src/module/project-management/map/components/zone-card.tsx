"use client";

import { IGeoTabZone, IGeoTabZoneType } from "@/module/schedule-management/schedule-configuration/types/zone";
import { cn } from "@/lib/utils/utils";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { MapPin } from "lucide-react";
import { getZoneTypeId } from "../utils/zone";
import { DATE_FORMAT } from "@/types/date";

interface ZoneCardProps {
	zone: IGeoTabZone;
	zoneTypes: IGeoTabZoneType[];
	color: string;
	isSelected: boolean;
	onClick: () => void;
}

const ZoneCard = ({ zone, zoneTypes, color, isSelected, onClick }: ZoneCardProps) => {
	const typeId = getZoneTypeId(zone);
	const zoneType = zoneTypes.find((t) => t.GeotabId === typeId);

	return (
		<div
			onClick={onClick}
			className={cn(
				"flex cursor-pointer overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md",
				isSelected ? "border-brand-green shadow-md" : "border-grey-400"
			)}
		>
			<div className="flex w-28 flex-shrink-0 flex-col justify-end p-3" style={{ backgroundColor: color + "CC" }}>
				<span className="line-clamp-4 text-sm font-bold leading-tight text-white drop-shadow">{zone.Name}</span>
			</div>

			<div className="flex flex-1 flex-col justify-between p-4">
				<div className="space-y-1">
					{zoneType && (
						<div className="flex items-center gap-1.5">
							<div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
							<span className="text-xs font-medium text-brand-grey">{zoneType.Name?.replaceAll("*", " ")}</span>
						</div>
					)}
					<h3 className="line-clamp-2 text-sm font-semibold text-brand-black">{zone.Name}</h3>
					{zone.Comment && <p className="line-clamp-2 text-xs text-brand-lightgrey">{zone.Comment}</p>}
				</div>

				<div className="mt-3 flex items-center justify-between">
					<div className="space-y-0.5 text-xs text-brand-lightgrey">
						{zone.ActiveFrom && (
							<p>
								From:{" "}
								<span className="font-medium text-brand-grey">
									{toLocalFormattedDate(zone.ActiveFrom, DATE_FORMAT.MM_SLASH_DD_YYYY)}
								</span>
							</p>
						)}
					</div>
					<button
						className={cn(
							"flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
							isSelected
								? "bg-brand-green text-white"
								: "bg-grey-100 text-brand-grey hover:bg-brand-green hover:text-white"
						)}
					>
						<MapPin size={11} />
						{isSelected ? "Focused" : "Focus"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ZoneCard;
