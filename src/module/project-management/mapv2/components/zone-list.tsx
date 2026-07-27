"use client";

import { RefObject } from "react";
import { Spinner } from "@/components/ui/spinner";
import ZoneCard from "./zone-card";
import { IGetMapZone } from "../types/zone";

interface ZoneListProps {
	zones: IGetMapZone[];
	isLoading?: boolean;
	selectedId: string | null;
	onCardClick: (id: string) => void;
	onEdit: (zone: IGetMapZone) => void;
	onDelete: (zone: IGetMapZone) => void;
	cardRefsMap: RefObject<Map<string, HTMLElement>>;
}

const ZoneList = ({ zones, isLoading, selectedId, onCardClick, onEdit, onDelete, cardRefsMap }: ZoneListProps) => {
	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (zones.length === 0) {
		return <p className="p-4 text-center text-sm text-brand-grey">No zones found.</p>;
	}

	return (
		<div className="flex flex-col gap-2">
			{zones.map((zone) => (
				<ZoneCard
					key={zone.id}
					ref={(el) => {
						if (el) cardRefsMap.current?.set(zone.id, el);
					}}
					zone={zone}
					isSelected={selectedId === zone.id}
					onClick={() => onCardClick(zone.id)}
					onEdit={() => onEdit(zone)}
					onDelete={() => onDelete(zone)}
				/>
			))}
		</div>
	);
};

export default ZoneList;
