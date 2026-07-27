import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { usePublishAJob } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import React from "react";

const PublishAJob = ({ dailyJobId }: { dailyJobId: string }) => {
	const { mutate: publishJob } = usePublishAJob();

	const handlePublishJob = () => {
		publishJob(
			{ dailyJobId },
			{
				onSuccess: () => {
					openSuccessToast("Job published successfully");
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};
	return (
		<Button key="publish" className="w-full" variant={"filled"} onClick={handlePublishJob}>
			Publish
		</Button>
	);
};

export default PublishAJob;
