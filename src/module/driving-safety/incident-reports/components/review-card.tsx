import { ReactNode } from "react";

import { cn } from "@/lib/utils/utils";

export const ReviewCard = ({
	title,
	action,
	children,
	className,
}: {
	title?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
}) => (
	<section className={cn("rounded-[12px] bg-white p-5 shadow-sm", className)}>
		{(title || action) && (
			<div className="flex shrink-0 items-center justify-between gap-2 border-b pb-2">
				{title && <h3 className="text-sm font-semibold tracking-wide text-brand-dark50">{title}</h3>}
				{action}
			</div>
		)}
		{children}
	</section>
);

export const ReviewRow = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className="flex flex-col gap-1 border-b border-brand-dark10 py-2 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
		<span className="text-sm text-brand-dark50">{label}</span>
		<span className="text-sm font-medium text-brand-dark sm:max-w-[60%] sm:text-right">{value}</span>
	</div>
);

export const ReviewRowGrid = ({ children }: { children: ReactNode }) => (
	<div className="mt-3 grid grid-cols-1 gap-x-10 lg:grid-cols-1">{children}</div>
);
