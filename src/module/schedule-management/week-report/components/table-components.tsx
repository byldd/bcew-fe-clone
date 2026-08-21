import { cn } from "@/lib/utils/utils";

export const SectionTableHead = ({ children }: { children: React.ReactNode }) => (
	<th className="text-nowrap border-b border-r px-3 py-2 text-left text-xs font-semibold text-brand-dark50">
		{children}
	</th>
);

export const SectionTableCell = ({ children }: { children: React.ReactNode }) => (
	<td className="border-b border-r px-3 py-2 text-left text-xs text-brand-dark">{children}</td>
);

export const ReportSection = ({
	title,
	bare,
	children,
}: {
	title: string;
	bare?: boolean;
	children: React.ReactNode;
}) => (
	<div>
		<h4 className="mb-2 text-sm font-bold text-brand-dark">{title}</h4>
		{bare ? children : <div className="overflow-x-auto rounded-lg border">{children}</div>}
	</div>
);

export const StatusBadge = ({ isApproved }: { isApproved: boolean | null | undefined }) => (
	<span
		className={cn(
			"font-medium",
			isApproved === true ? "text-green-600" : isApproved === false ? "text-red-600" : "text-yellow-600"
		)}
	>
		{isApproved === true ? "Approved" : isApproved === false ? "Rejected" : "Pending"}
	</span>
);
