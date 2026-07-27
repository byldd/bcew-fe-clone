"use client";

import { forwardRef } from "react";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { IGetMapZone } from "../types/zone";
import { getZoneColor } from "../utils/zone-color";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
import { MODULE } from "@/utils/enums";

interface ZoneCardProps {
	zone: IGetMapZone;
	isSelected?: boolean;
	onClick?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

const ZoneCard = forwardRef<HTMLDivElement, ZoneCardProps>(({ zone, isSelected, onClick, onEdit, onDelete }, ref) => {
	const color = zone.mapZoneType?.color ?? getZoneColor(zone.mapZoneType?.id ?? zone.id);

	return (
		<div
			ref={ref}
			onClick={onClick}
			className={cn(
				"flex cursor-pointer items-start justify-between gap-2 rounded-lg border border-brand-dark10 p-3 transition-colors",
				isSelected ? "bg-brand-dark10" : "bg-white hover:bg-brand-dark10"
			)}
		>
			<div className="flex items-start gap-2">
				<span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
				<div>
					<p className="text-sm font-medium text-brand-dark">{zone.name}</p>
					<p className="text-xs text-brand-grey">{zone.mapZoneType?.name}</p>
					{zone.fullAddress && (
						<p className="mt-1 flex items-center gap-1 text-xs text-brand-grey">
							<MapPin size={12} />
							{zone.fullAddress}
						</p>
					)}
				</div>
			</div>

			<WriteAccessWrapper moduleName={MODULE.WEEKLY_SCHEDULE}>
				<div className="flex flex-shrink-0 items-center gap-2">
					{onEdit && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onEdit();
							}}
							aria-label="Edit zone"
							className="text-brand-grey hover:text-brand-dark"
						>
							<Pencil size={14} />
						</button>
					)}
					{onDelete && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							aria-label="Delete zone"
							className="text-brand-grey hover:text-red-500"
						>
							<Trash2 size={14} />
						</button>
					)}
				</div>
			</WriteAccessWrapper>
		</div>
	);
});

ZoneCard.displayName = "ZoneCard";

export default ZoneCard;
