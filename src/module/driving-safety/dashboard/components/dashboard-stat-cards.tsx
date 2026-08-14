import { cn } from "@/lib/utils/utils";

import { IDrivingSafetyDashboardSummary } from "../types";
import { DASHBOARD_STAT_CARDS } from "../utils/constants";
import { formatToUSCurrency } from "../utils/week-range";

const DashboardStatCards = ({
	summary,
	isLoading,
}: {
	summary?: IDrivingSafetyDashboardSummary;
	isLoading: boolean;
}) => (
	<div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
		{DASHBOARD_STAT_CARDS.map((card) => (
			<div key={card.key} className="flex flex-col gap-2 rounded-[12px] border-none bg-white p-4 shadow-sm">
				<span className="text-xs font-medium text-brand-dark50">{card.label}</span>
				{isLoading || !summary ? (
					<span className={cn("h-8 w-16 animate-pulse rounded-[6px] bg-brand-bgLightgrey")} />
				) : (
					<span className="text-[26px] font-bold leading-none text-brand-dark">
						{formatToUSCurrency(summary[card.key], card.isCurrency)}
					</span>
				)}
				{card.subtitle && <span className="text-xs text-brand-dark50">{card.subtitle}</span>}
			</div>
		))}
	</div>
);

export default DashboardStatCards;
