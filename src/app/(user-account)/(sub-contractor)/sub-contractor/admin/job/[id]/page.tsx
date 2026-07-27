import { SubContractorJobDetailsTemplate } from "@/module/sub-contractor/templates/sub-contractor-job-details-template";

/**
 * Made async because `params` is now a Promise in Next.js 15.
 */
export default async function SubContractorJobDetails({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	return <SubContractorJobDetailsTemplate dailyJobId={id} />;
}
