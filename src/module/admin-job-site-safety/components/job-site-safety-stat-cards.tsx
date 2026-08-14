import { IJobSiteSafetyDashboardRow } from "../types";
import { buildJobSiteSafetyStats } from "../utils/dashboard-stats";

const JobSiteSafetyStatCards = ({ rows }: { rows: IJobSiteSafetyDashboardRow[] }) => (
	<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
		{buildJobSiteSafetyStats(rows).map((stat) => (
			<div key={stat.label} className="rounded-[10px] bg-white p-4 shadow-sm">
				<p className="text-xs text-brand-grey">{stat.label}</p>
				<p className="mt-2 text-2xl font-semibold text-brand-dark">{stat.value}</p>
			</div>
		))}
	</div>
);

export default JobSiteSafetyStatCards;
