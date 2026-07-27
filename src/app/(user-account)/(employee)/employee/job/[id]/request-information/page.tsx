import BackButton from "@/components/common/back-button";

export default function RequestInformationPage() {
	return (
		<div className="min-h-screen bg-brand-bgLightgrey px-4 py-6">
			<div className="mb-4 flex items-center gap-2">
				<BackButton />
				<h1 className="text-lg font-semibold text-brand-dark">Request Information</h1>
			</div>
			<div className="rounded-[10px] border border-brand-dark10 bg-white px-4 py-6 text-sm text-brand-dark">
				<p>Placeholder page for Request Information.</p>
			</div>
		</div>
	);
}
