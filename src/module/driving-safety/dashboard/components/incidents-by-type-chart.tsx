import { IViolationTypeBreakdown } from "../types";
import { VIOLATION_TYPE_BAR_COLORS } from "../utils/constants";

const IncidentsByTypeChart = ({ data, isLoading }: { data?: IViolationTypeBreakdown[]; isLoading: boolean }) => {
	const items = data ?? [];
	const maxCount = Math.max(1, ...items.map((item) => item.count));

	return (
		<div className="flex min-h-0 flex-col gap-5 rounded-[12px] border border-brand-dark10 bg-white p-5 lg:h-[300px]">
			<h3 className="shrink-0 text-sm font-medium text-brand-dark50">Incidents by Type (Safety Violation)</h3>

			{isLoading ? (
				<div className="flex flex-col gap-5">
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className="h-6 animate-pulse rounded-full bg-brand-bgLightgrey" />
					))}
				</div>
			) : items.length === 0 ? (
				<p className="py-8 text-center text-sm text-brand-dark50">No violations recorded for this period.</p>
			) : (
				<div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
					<div className="flex flex-col gap-4">
						{items.map((item, index) => (
							<div key={item.name} className="flex flex-col gap-2">
								<div className="flex items-center justify-between text-xs">
									<span className="font-medium text-brand-dark50">{item.name}</span>
									<span className="font-medium text-brand-dark">{item.count}</span>
								</div>
								<div className="h-2 w-full overflow-hidden rounded-full bg-brand-bgLightgrey">
									<div
										className="h-full rounded-full"
										style={{
											width: `${(item.count / maxCount) * 100}%`,
											backgroundColor: VIOLATION_TYPE_BAR_COLORS[index % VIOLATION_TYPE_BAR_COLORS.length],
										}}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default IncidentsByTypeChart;
