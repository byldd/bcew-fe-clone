"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import {
	JobDetailsIconImage,
	MaterialRequestIconImage,
	TrainingInformationIconImage,
	TroubleshootingIconImage,
} from "@/components/ui/all-icons";
import { QUICK_ACTIONS } from "@/module/job/material-selection/utils/enums";

const quickActions = [
	{ key: QUICK_ACTIONS.REQUEST_MATERIAL, label: "Request Material", Icon: MaterialRequestIconImage },
	{ key: QUICK_ACTIONS.REQUEST_INFORMATION, label: "Request Information", Icon: TrainingInformationIconImage },
	{ key: QUICK_ACTIONS.OTHER_REQUEST, label: "Other Request", Icon: TroubleshootingIconImage },
	{ key: QUICK_ACTIONS.SUBMIT_PLAN_CHANGE, label: "Submit Plan Change", Icon: JobDetailsIconImage },
];

export function SubcontractorQuickActions({
	jobDailyRecordId,
	isAdmin,
}: {
	jobDailyRecordId: string;
	isAdmin: boolean;
}) {
	const router = useRouter();

	const getMaterialSelectionPath = () =>
		isAdmin
			? routes.subContractor.adminMaterialSelection(jobDailyRecordId)
			: routes.subContractor.crewLeaderMaterialSelection(jobDailyRecordId);

	const basePath = isAdmin
		? routes.subContractor.adminJob(jobDailyRecordId)
		: routes.subContractor.crewLeaderJob(jobDailyRecordId);

	return (
		<div className="rounded-[10px] border border-brand-dark10 bg-white px-4 py-3">
			<p className="text-xs font-semibold text-brand-dark50">Quick Actions</p>
			<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
				{quickActions.map((action) => (
					<Button
						key={action.key}
						variant="outline"
						size="sm"
						onClick={() =>
							action.key === QUICK_ACTIONS.REQUEST_MATERIAL
								? router.push(getMaterialSelectionPath())
								: router.push(`${basePath}/${action.key}`)
						}
						className="min-h-[64px] flex-col gap-1 px-2 py-2 text-[10px] font-medium text-brand-dark"
					>
						<action.Icon className="h-4 w-4" />
						<span className="text-center text-[10px] leading-tight">{action.label}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
