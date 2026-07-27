import { Button } from "@/components/ui/button";
import { IActrec, ISubcontractorForJobs, JobStatus } from "@/module/sub-contractor/types";
import { IJobLabelAssignments } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import BackButton from "@/components/common/back-button";
import { labelSelectionOrder, legendItems } from "@/module/employee-dashboard/constants/legend-items";
import { ColorFor, getCardColorClass } from "@/module/schedule-management/weekly-schedule-management/utils/job-card";
interface ISubContractorJobHeader {
	taskJobInfo: IActrec;
	subContractor: ISubcontractorForJobs;
	jobLabelAssignments: IJobLabelAssignments[];
	isJobTimeLogAvailable: boolean;
	onBack: () => void;
	handleAssignCrew: () => void;
	hasAssignedCrew: boolean;
	isPastDate: boolean;
}

export function SubContractorJobHeader({
	taskJobInfo,
	jobLabelAssignments,
	isJobTimeLogAvailable,
	handleAssignCrew,
	hasAssignedCrew,
	isPastDate,
}: ISubContractorJobHeader) {
	const { user } = useAuthStore((state) => state);
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const label =
		Array.isArray(jobLabelAssignments) && jobLabelAssignments.length
			? labelSelectionOrder
					.map((labelSelection) => jobLabelAssignments.find((jobLabel) => jobLabel.labelId === labelSelection))
					.find(Boolean) || jobLabelAssignments[0]
			: undefined;

	const Icon = statusIcons[label?.labelId as JobStatus];
	const legend = legendItems.find((item) => item.status === label?.labelId);

	return (
		<div className="my-4 flex items-center justify-between">
			<div className="flex w-full flex-col">
				<div className="flex min-w-0 items-center gap-2">
					<BackButton />
					<h1 className="font-inter text-xl font-semibold text-brand-dark">{taskJobInfo?.jobnme}</h1>
				</div>
				<p className="ml-10 text-xs font-normal text-brand-dark">
					{tSub.job} #{taskJobInfo?.recnum}
				</p>

				<div className="mt-4 flex w-full items-center justify-between gap-2 px-6">
					{/* Labels + subcontractor name */}
					<div className="flex max-w-[60%] shrink-0 flex-wrap items-center gap-2">
						<div key={label?.id} className="flex items-center gap-2">
							<span>{Icon}</span>
							<span className={getCardColorClass(label ? [label.labelId] : [], ColorFor.TEXT)}>{legend?.label}</span>
						</div>
					</div>

					<div className="ml-2 max-w-[40%] shrink-0">
						{user?.id && (
							<Button
								disabled={isPastDate || isJobTimeLogAvailable}
								variant="filled"
								onClick={() => handleAssignCrew()}
								className="h-[34px]"
							>
								{hasAssignedCrew ? tSub.changeCrew : tSub.assignCrew}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
