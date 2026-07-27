import React from "react";

const PolicySectionCard = ({ title, meta, children }: { title: string; meta: string; children: React.ReactNode }) => (
	<section className="rounded-xl border border-brand-dark10 bg-white">
		<div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4">
			<h4 className="text-base font-medium text-brand-dark">{title}</h4>
			<p className="text-xs text-brand-greyLight">{meta}</p>
		</div>

		{children}
	</section>
);

export default PolicySectionCard;
