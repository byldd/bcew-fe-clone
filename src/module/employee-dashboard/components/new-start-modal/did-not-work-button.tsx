import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useModal } from "@/hooks/useModal";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { useUpdateJobEmployeeDidNotWorked } from "@/module/job/hooks/useEmployeeSchedule";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";

const DidNotWorkButton = ({ assignmentId, onClose }: { assignmentId?: string; onClose: () => void }) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const queryClient = useQueryClient();
	const router = useRouter();
	const { mutate: updateJobDidNotWorked } = useUpdateJobEmployeeDidNotWorked();
	const { openModal, Modal } = useModal();
	const handleDidNotWork = () => {
		if (!assignmentId) {
			return openErrorToast({ message: `The stop is not available.` });
		}

		updateJobDidNotWorked(assignmentId, {
			onSuccess: () => {
				openSuccessToast(tEmployee.jobStatusDidNotWork);
				queryClient.invalidateQueries({ queryKey: ["employee-daily-job"] });
				onClose();
				router.replace(routes.employee.dashboard);
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const handleOpenModal = () => {
		openModal({
			modalTitle: tEmployee.confirmDidNotWorkStop,

			modalView: (
				<Button variant="filled" className="w-full" onClick={handleDidNotWork}>
					{tEmployee.confirm}
				</Button>
			),

			subHeader: tEmployee.confirmZeroHoursStop,
			showDefaultClose: true,
		});
	};
	return (
		<div>
			<Button className="h-10 w-full px-8 underline underline-offset-4" onClick={handleOpenModal}>
				{tEmployee.didNotWorkStop}
			</Button>
			<Modal />
		</div>
	);
};

export default DidNotWorkButton;
