import { IAttendanceDashboardStats } from "../types";
import { buildAttendanceStats } from "../utils/dashboard-stats";

const AttendanceStatCards = ({ stats }: { stats: IAttendanceDashboardStats }) => (
	<div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
		{buildAttendanceStats(stats).map((stat) => (
			<div key={stat.label} className="flex flex-col gap-2 rounded-[12px] border-none bg-white p-4 shadow-sm">
				<span className="text-xs font-medium text-brand-dark50">{stat.label}</span>
				<span className="text-[26px] font-bold leading-none text-brand-dark">{stat.value}</span>
				{stat.subtitle && <span className="text-xs text-brand-dark50">{stat.subtitle}</span>}
			</div>
		))}
	</div>
);

export default AttendanceStatCards;
