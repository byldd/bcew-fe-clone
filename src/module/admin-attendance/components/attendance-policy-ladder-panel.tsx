import { Pencil } from "lucide-react";
import { IAttendanceSummaryItem } from "../types";

const AttendancePolicyLadderPanel = ({ title, items }: { title: string; items: IAttendanceSummaryItem[] }) => (
	<div className="flex flex-col gap-5 rounded-[12px] border border-brand-dark10 bg-white p-5">
		<div className="flex items-center justify-between">
			<h3 className="text-sm font-medium text-brand-dark50">{title}</h3>
			<Pencil size={14} className="text-brand-dark50" aria-hidden="true" />
		</div>

		<ul className="divide-y divide-brand-dark10">
			{items.map((item) => (
				<li key={item.label} className="flex items-center justify-between py-2 text-sm">
					<span className="font-medium text-brand-dark50">{item.label}</span>
					<span className="font-medium text-brand-dark">{item.points} points</span>
				</li>
			))}
		</ul>
	</div>
);

export default AttendancePolicyLadderPanel;
