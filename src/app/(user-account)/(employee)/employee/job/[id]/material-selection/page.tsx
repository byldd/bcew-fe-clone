import MaterialSelectionTemplate from "@/module/job/material-selection/templates/material-selection-template";
import { parseNumberParam } from "@/module/job/material-selection/utils";

type MaterialSelectionSearchParams = {
	recnum?: string;
	tsknum?: string;
};

export default async function MaterialSelectionPage({
	searchParams,
}: {
	searchParams: Promise<MaterialSelectionSearchParams>;
}) {
	const resolvedSearchParams = await searchParams;
	const jobnum = parseNumberParam(resolvedSearchParams.recnum);
	const tsknum = parseNumberParam(resolvedSearchParams.tsknum);

	return <MaterialSelectionTemplate jobnum={jobnum} tsknum={tsknum} />;
}
