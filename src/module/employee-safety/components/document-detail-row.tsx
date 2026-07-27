const DocumentDetailRow = ({ label, value, href }: { label: string; value: string; href?: string }) => (
	<div className="flex items-start justify-between gap-4 border-b border-brand-bgLightgrey py-2.5 last:border-none">
		<p className="shrink-0 text-xs text-brand-dark">{label}</p>
		{href ? (
			<a href={href} className="text-right text-xs font-medium text-blue-600 underline">
				{value}
			</a>
		) : (
			<p className="text-right text-xs font-medium text-brand-dark">{value}</p>
		)}
	</div>
);

export default DocumentDetailRow;
