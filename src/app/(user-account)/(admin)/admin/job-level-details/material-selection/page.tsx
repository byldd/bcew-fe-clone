import AdminMaterialSelectionTemplate from "@/module/job-level-details/material-selection/templates/admin-material-selection-template";
import { parseNumberParam } from "@/module/job/material-selection/utils";

type AdminMaterialSelectionSearchParams = {
	jobDailyRecordId?: string;
	jobnum?: string;
	tsknum?: string;
};

export default async function AdminMaterialSelectionPage({
	searchParams,
}: {
	searchParams: Promise<AdminMaterialSelectionSearchParams>;
}) {
	const resolvedSearchParams = await searchParams;
	const jobnum = parseNumberParam(resolvedSearchParams.jobnum);
	const tsknum = parseNumberParam(resolvedSearchParams.tsknum);

	return (
		<AdminMaterialSelectionTemplate
			jobDailyRecordId={resolvedSearchParams.jobDailyRecordId}
			jobnum={jobnum}
			tsknum={tsknum}
		/>
	);
}
