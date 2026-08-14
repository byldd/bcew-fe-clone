const AddRecordComingSoon = ({ title }: { title: string }) => (
	<div className="rounded-[10px] border bg-white p-8 text-center">
		<p className="text-sm font-medium text-brand-dark">{title}</p>
		<p className="mt-1 text-xs text-brand-grey">This tab is not available yet.</p>
	</div>
);

export default AddRecordComingSoon;
