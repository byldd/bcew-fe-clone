import AdminMaterialSelectionTemplate from "@/module/job-level-details/material-selection/templates/admin-material-selection-template";
import { parseNumberParam } from "@/module/job/material-selection/utils";

type AdminMaterialSelectionSearchParams = {
	jobDailyRecordId?: string;
	userId?: string;
	jobnum?: string;
	tsknum?: string;
	missingItemRequestId?: string;
};

export default async function AdminMaterialSelectionPage({
	searchParams,
}: {
	searchParams: Promise<AdminMaterialSelectionSearchParams>;
}) {
	const resolvedSearchParams = await searchParams;
	const jobnum = parseNumberParam(resolvedSearchParams.jobnum);
	const tsknum = parseNumberParam(resolvedSearchParams.tsknum);
	const userId = resolvedSearchParams.userId;

	return (
		<AdminMaterialSelectionTemplate
			jobDailyRecordId={resolvedSearchParams.jobDailyRecordId}
			jobnum={jobnum}
			tsknum={tsknum}
			userId={userId}
			missingItemRequestId={resolvedSearchParams.missingItemRequestId}
		/>
	);
}
