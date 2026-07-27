"use client";

import { cn } from "@/lib/utils/utils";
import { MapPin } from "lucide-react";
import { IVendor, MapTab } from "../types/zone";
import { MAP_TAB_COLOR } from "../utils/zone";

const COLOR = MAP_TAB_COLOR[MapTab.VENDOR];

interface VendorCardProps {
	vendor: IVendor;
	isSelected: boolean;
	onClick: () => void;
}

const VendorCard = ({ vendor, isSelected, onClick }: VendorCardProps) => {
	return (
		<div
			onClick={onClick}
			className={cn(
				"flex cursor-pointer overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md",
				isSelected ? "shadow-md" : "border-grey-400"
			)}
			style={isSelected ? { borderColor: COLOR } : undefined}
		>
			{/* Left colored strip */}
			<div className="flex w-28 flex-shrink-0 flex-col justify-end p-3" style={{ backgroundColor: COLOR + "CC" }}>
				<span className="line-clamp-4 text-sm font-bold leading-tight text-white drop-shadow">{vendor.name}</span>
			</div>

			{/* Right content */}
			<div className="flex flex-1 flex-col justify-between p-4">
				<div className="space-y-1">
					<div className="flex items-center gap-1.5">
						<div className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: COLOR }} />
						<span className="text-xs font-medium text-brand-grey">Vendor</span>
					</div>
					<h3 className="line-clamp-1 text-sm font-semibold text-brand-black">{vendor.name}</h3>
					{vendor.address && <p className="line-clamp-2 text-xs text-brand-lightgrey">{vendor.address}</p>}
				</div>

				<div className="mt-3 flex items-center justify-end">
					<button
						className={cn(
							"flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
							isSelected ? "text-white" : "bg-grey-100 text-brand-grey"
						)}
						style={isSelected ? { backgroundColor: COLOR } : undefined}
					>
						<MapPin size={11} />
						{isSelected ? "Focused" : "Focus"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default VendorCard;
