export default function MaterialRequestLegend({ isForeman }: { isForeman?: boolean }) {
	return (
		<div className="flex items-center gap-2 text-xs text-brand-dark50">
			<span className="font-medium">Legend:</span>
			<span className="flex items-center gap-1.5">
				<span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
				Not in pull list
			</span>
			{isForeman && (
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
					Unknown
				</span>
			)}
		</div>
	);
}
