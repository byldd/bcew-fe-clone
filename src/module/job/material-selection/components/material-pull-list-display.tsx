"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useEmployeePullList } from "../hooks/useEmployeePullList";
import { filterMaterialsWithTakeoff, mapPullListItemsToMaterials, mapTakeoffItemsToMaterials } from "../utils";
import { MATERIAL_AVAILABILITY } from "../utils/enums";
import type { MaterialSelectionItem } from "../utils/types";
import MaterialQuantityBadges from "./material-quantity-badges";

export default function MaterialPullListDisplay({ assignmentId }: { assignmentId?: string }) {
	const [query, setQuery] = useState("");
	const { data, isLoading, isError } = useEmployeePullList({ assignmentId });

	const items = useMemo(() => mapPullListItemsToMaterials(data?.items ?? []), [data?.items]);
	const takeoffItems = useMemo(
		() => mapTakeoffItemsToMaterials(data?.takeoffItems ?? [], data?.items ?? []),
		[data?.takeoffItems, data?.items]
	);
	const filteredItems = useMemo(
		() => filterMaterialsWithTakeoff({ items, takeoffItems, query }),
		[items, takeoffItems, query]
	);

	const renderItem = (item: MaterialSelectionItem) => (
		<div
			key={item.partId}
			className="flex items-start justify-between gap-2 rounded-[12px] border border-brand-dark10 bg-white px-3 py-3"
		>
			<div className="min-w-0">
				<p className="text-xs font-semibold text-brand-dark50">({item.code})</p>
				<p className="text-sm font-semibold text-brand-dark">{item.name}</p>
			</div>
			<div className="flex shrink-0 flex-col items-end gap-1">
				<MaterialQuantityBadges
					orders={item.orders}
					checked={item.checked}
					received={item.received}
					backorder={item.backorder}
				/>
				<div className="text-right text-[10px] font-medium text-brand-dark50">
					<span className="text-xs">{item.phase}</span>
					<span className="mx-1">•</span>
					<span className="text-xs">{item.vendor}</span>
					<span className="mx-1">•</span>
					<span
						className={
							item.stockStatus === MATERIAL_AVAILABILITY.IN_STOCK ? "text-xs text-emerald-600" : "text-xs text-rose-500"
						}
					>
						{item.stockStatus}
					</span>
				</div>
			</div>
		</div>
	);

	return (
		<div className="space-y-3">
			<Input
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				placeholder="Search by part name or number"
				icon={<Search className="h-4 w-4 text-brand-dark50" />}
				className="rounded-[12px] border border-white bg-white"
			/>

			{isLoading ? (
				<div className="flex justify-center py-6">
					<Spinner />
				</div>
			) : isError ? (
				<div className="rounded-[12px] border border-brand-dark10 bg-white px-4 py-6 text-center text-sm text-brand-dark50">
					No pull list available.
				</div>
			) : filteredItems.length === 0 ? (
				<div className="rounded-[12px] border border-brand-dark10 bg-white px-4 py-6 text-center text-sm text-brand-dark50">
					No matching items.
				</div>
			) : (
				<div className="space-y-2">{filteredItems.map(renderItem)}</div>
			)}
		</div>
	);
}
