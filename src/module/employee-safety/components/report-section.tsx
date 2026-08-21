import React from "react";

type ReportSectionProps = {
	title: string;
	children: React.ReactNode;
};

const ReportSection = ({ title, children }: ReportSectionProps) => (
	<section className="space-y-3 rounded-[8px] bg-white p-3">
		<h4 className="text-sm font-semibold text-brand-grey">{title}</h4>
		{children}
	</section>
);

export default ReportSection;
