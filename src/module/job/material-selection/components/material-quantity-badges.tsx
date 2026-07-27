import type { MaterialSelectionItem } from "../utils/types";

type MaterialQuantityBadgesProps = Pick<MaterialSelectionItem, "orders" | "checked" | "received" | "backorder">;

const QUANTITY_BADGES = [
	{ key: "orders", label: "ORD" },
	{ key: "checked", label: "CHK" },
	{ key: "received", label: "RCV" },
] as const;

export default function MaterialQuantityBadges({ orders, checked, received, backorder }: MaterialQuantityBadgesProps) {
	const values: MaterialQuantityBadgesProps = { orders, checked, received, backorder };

	return (
		<div className="flex items-center gap-1 text-center">
			{QUANTITY_BADGES.map(({ key, label }) => (
				<span
					key={key}
					className="flex min-w-[40px] flex-col items-center gap-0.5 rounded-[8px] bg-brand-dark10 px-2 py-1 leading-tight"
				>
					<span className="text-[10px] font-medium text-brand-dark50">{label}</span>
					<span className="text-xs font-semibold text-brand-dark">{values[key]}</span>
				</span>
			))}
			<span className="flex min-w-[40px] flex-col items-center gap-0.5 rounded-[8px] bg-rose-100 px-2 py-1 leading-tight text-rose-600">
				<span className="text-[10px] font-medium">BO</span>
				<span className="text-xs font-semibold">{backorder ?? "--"}</span>
			</span>
		</div>
	);
}
