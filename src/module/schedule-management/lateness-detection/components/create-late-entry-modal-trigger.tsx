"use client";

import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/button";
import CreateTimeVarianceEntryModal from "./create-time-variance-entry-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
import { MODULE } from "@/utils/enums";

const CreateLateEntryModalTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	return (
		<WriteAccessWrapper moduleName={MODULE.TIME_LOGS}>
			<div>
				<Button
					variant="filled"
					className="h-10"
					onClick={() =>
						openModal({
							modalTitle: tTimeLogs.createEntry,
							modalView: <CreateTimeVarianceEntryModal closeModal={closeModal} />,
							variant: "medium",
						})
					}
				>
					{tTimeLogs.createEntry}
				</Button>
				<Modal />
			</div>
		</WriteAccessWrapper>
	);
};

export default CreateLateEntryModalTrigger;
