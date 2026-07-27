import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FiEdit } from "react-icons/fi";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { isJobNewStart } from "../utils";
import { IJobUpdatesSectionProps } from "../types";
import { CollapsibleSection } from "./collapsible-section";
import { JobUpdatesCard } from "./job-updates-card";
import { NewStartCard } from "./new-start-card";

export function JobUpdatesSection({
	jobData,
	notReadyUpdate,
	isTaskLeader,
	onNewStartEdit,
	onJobUpdateEdit,
}: IJobUpdatesSectionProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const showNewStart = isJobNewStart(jobData?.jobLabelAssignments, jobData?.notReadyUpdate?.isReady);
	const showJobUpdates = !jobData?.specialJob;

	if (!showNewStart && !showJobUpdates) {
		return null;
	}

	return (
		<div className="rounded-[10px] border border-brand-dark10 bg-white px-4 py-3">
			<CollapsibleSection
				title={tEmployee.jobUpdates}
				contentClassName="space-y-4"
				action={
					showJobUpdates ? (
						<Button
							variant="ghost"
							disabled={!isTaskLeader}
							onClick={onJobUpdateEdit}
							className="h-auto p-0 hover:bg-transparent"
							aria-label={tEmployee.jobUpdates}
						>
							<FiEdit className="h-[18px] w-[18px] !text-brand-dark" />
						</Button>
					) : undefined
				}
			>
				{showNewStart && (
					<NewStartCard
						notReadyUpdate={notReadyUpdate}
						handleEditButtonClick={onNewStartEdit}
						isDisabled={!isTaskLeader}
						bordered={false}
					/>
				)}
				{showNewStart && showJobUpdates && <Separator className="bg-brand-dark10" />}
				{showJobUpdates && <JobUpdatesCard jobData={jobData} />}
			</CollapsibleSection>
		</div>
	);
}
