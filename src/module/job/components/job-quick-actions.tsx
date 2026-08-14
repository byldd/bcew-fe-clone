"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FilePlus2, QrCode, Undo2 } from "lucide-react";
import { routes } from "@/config/routes";
import {
	JobDetailsIconImage,
	MaterialRequestIconImage,
	TrainingInformationIconImage,
	TroubleshootingIconImage,
} from "@/components/ui/all-icons";
import useAuthStore from "@/store/auth-store";
import { E_ROLES } from "@/utils/enums";
import { QUICK_ACTIONS } from "../material-selection/utils/enums";
import { canSelectAddendumReason } from "../material-selection/utils";

const quickActions = [
	{ key: QUICK_ACTIONS.REQUEST_MATERIAL, label: "Request Material", Icon: MaterialRequestIconImage },
	{ key: QUICK_ACTIONS.REQUEST_INFORMATION, label: "Request Information", Icon: TrainingInformationIconImage },
	{ key: QUICK_ACTIONS.OTHER_REQUEST, label: "Other Request", Icon: TroubleshootingIconImage },
	{ key: QUICK_ACTIONS.SUBMIT_PLAN_CHANGE, label: "Submit Plan Change", Icon: JobDetailsIconImage },
];

const crateQuickActions = [
	{
		key: "scan-crate-received",
		label: "Scan Crate Received",
		Icon: QrCode,
		href: routes.employee.crateManagementScanReceive,
	},
	{
		key: "scan-crate-return",
		label: "Scan Crate Return",
		Icon: Undo2,
		href: routes.employee.crateManagementScanReturn,
	},
];

export function JobQuickActions({
	assignmentId,
	recnum,
	tsknum,
	isMaterialRequestAllowed,
	isCrateHandlerAllowed,
}: {
	assignmentId: string;
	recnum?: string | null;
	tsknum?: string | null;
	isMaterialRequestAllowed?: boolean;
	isCrateHandlerAllowed?: boolean;
}) {
	const router = useRouter();
	const { user } = useAuthStore();
	const basePath = routes.employee.job(assignmentId);
	const hasMaterialParams = typeof recnum === "string" && typeof tsknum === "string";

	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();
	const canSelectAddendum = canSelectAddendumReason({
		isForeman,
		materialRole: user?.materialRole,
		userType: user?.userType,
	});

	const visibleMaterialActions = isMaterialRequestAllowed
		? canSelectAddendum
			? [
					...quickActions,
					{ key: QUICK_ACTIONS.SUBMIT_ADDENDUM, label: "Addendum Being Submitted to Office", Icon: FilePlus2 },
				]
			: quickActions
		: [];

	const visibleCrateActions = isCrateHandlerAllowed ? crateQuickActions : [];

	const visibleQuickActions = [...visibleMaterialActions, ...visibleCrateActions];

	return (
		<div className="rounded-[10px] border border-brand-dark10 bg-white px-4 py-3">
			<p className="text-xs font-semibold text-brand-dark50">Quick Actions</p>
			<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
				{visibleQuickActions.map((action) => (
					<Button
						key={action.key}
						variant="outline"
						size="sm"
						onClick={() => {
							if ("href" in action && action.href) {
								router.push(action.href);
								return;
							}

							if (action.key === QUICK_ACTIONS.REQUEST_MATERIAL) {
								router.push(
									routes.employee.materialSelection(
										assignmentId,
										hasMaterialParams ? recnum : undefined,
										hasMaterialParams ? tsknum : undefined
									)
								);
								return;
							}

							router.push(`${basePath}/${action.key}`);
						}}
						className="h-auto min-h-[64px] flex-col gap-1 whitespace-normal px-2 py-2 text-[10px] font-medium text-brand-dark"
					>
						<action.Icon className="h-4 w-4 shrink-0" />
						<span className="break-words text-center text-[10px] leading-tight">{action.label}</span>
					</Button>
				))}
			</div>
		</div>
	);
}
