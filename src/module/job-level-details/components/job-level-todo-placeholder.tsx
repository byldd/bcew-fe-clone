import JobLevelCollapsibleSection from "./job-level-collapsible-section";

//TODO: Replace with actual data when API is ready. This is just to show the UI structure.
type TodoPlaceholderItem = {
	title: string;
	employeeName: string;
	createdDate: string;
	photos: string;
	dueDate: string;
	isComplete: boolean;
};

const TODO_PLACEHOLDER_ITEMS: TodoPlaceholderItem[] = [
	{
		title: "--",
		employeeName: "--",
		createdDate: "04/21/2026",
		photos: "0 Photos",
		dueDate: "04/21/2026",
		isComplete: false,
	},
];

export default function JobLevelTodoPlaceholder() {
	const totalCount = TODO_PLACEHOLDER_ITEMS.length;
	const completedCount = TODO_PLACEHOLDER_ITEMS.filter((item) => item.isComplete).length;

	return (
		<JobLevelCollapsibleSection
			title="To-Do List"
			expandLabel="Expand"
			collapseLabel="Collapse"
			headerMeta={
				<>
					<span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
						{totalCount} Item{totalCount === 1 ? "" : "s"}
					</span>
					<span className="text-xs font-medium text-brand-greyLight">{completedCount} completed</span>
				</>
			}
		>
			<div className="space-y-3">
				{TODO_PLACEHOLDER_ITEMS.map((item, index) => (
					<div key={item.title}>
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-start gap-2">
								<span
									className={`mt-1 h-4 w-4 rounded-full border ${
										item.isComplete ? "border-emerald-500 bg-emerald-500" : "border-brand-dark20 bg-white"
									}`}
								>
									{item.isComplete ? <span className="block text-center text-[10px] text-white">&#10003;</span> : null}
								</span>
								<div className="space-y-2">
									<p className="text-sm font-medium text-brand-dark">{item.title}</p>
									<p className="text-xs font-medium text-brand-dark50">
										Employee Name: {item.employeeName} . Created Date: {item.createdDate} . {item.photos}
									</p>
								</div>
							</div>
							<p className="text-xs font-medium text-brand-dark60">{item.dueDate}</p>
						</div>
						{index < TODO_PLACEHOLDER_ITEMS.length - 1 ? <div className="mt-3 border-b border-brand-dark10" /> : null}
					</div>
				))}
			</div>
		</JobLevelCollapsibleSection>
	);
}
