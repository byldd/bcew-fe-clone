import { ReactNode } from "react";

import { cn } from "@/lib/utils/utils";

export const ReviewCard = ({
	title,
	children,
	className,
}: {
	title?: string;
	children: ReactNode;
	className?: string;
}) => (
	<section className={cn("rounded-[12px] border border-brand-dark10 bg-white p-5", className)}>
		{title && <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-dark50">{title}</h3>}
		{children}
	</section>
);

export const ReviewRow = ({ label, value }: { label: string; value: ReactNode }) => (
	<div className="flex items-start justify-between gap-4 border-b border-dashed border-brand-dark10 py-2.5 last:border-b-0">
		<span className="text-sm text-brand-dark50">{label}</span>
		<span className="max-w-[60%] text-right text-sm font-medium text-brand-dark">{value}</span>
	</div>
);

export const ReviewRowGrid = ({ children }: { children: ReactNode }) => (
	<div className="grid grid-cols-1 gap-x-10 lg:grid-cols-2">{children}</div>
);
