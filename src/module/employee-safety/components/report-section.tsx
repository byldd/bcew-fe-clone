import React from "react";

type ReportSectionProps = {
	title: string;
	children: React.ReactNode;
};

const ReportSection = ({ title, children }: ReportSectionProps) => (
	<section className="space-y-2 rounded-[10px] border bg-white p-4">
		<h4 className="text-sm font-medium text-brand-dark">{title}</h4>
		{children}
	</section>
);

export default ReportSection;
