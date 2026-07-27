import { JobDetailPage } from "@/module/job/templates/job-detail-page";

/**
 * Made async because `params` is now a Promise in Next.js 15.
 */
export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <JobDetailPage assignmentId={id} />;
}
