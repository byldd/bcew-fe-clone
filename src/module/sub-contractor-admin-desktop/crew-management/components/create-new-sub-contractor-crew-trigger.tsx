import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import React from "react";
import CreateSubContractorCrewModal from "@/module/sub-contractor-admin-desktop/crew-management/modals/create-sub-contractor-crew-modal";
import SuccessModal from "@/components/success-modal";
import { useQueryClient } from "@tanstack/react-query";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const CreateSubContractorNewCrewTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();
	const queryClient = useQueryClient();
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const handleSuccessfulCrewCreation = (name: string) => {
		openModal({
			modalTitle: tSub.crewCreated,
			modalView: (
				<SuccessModal
					closeModal={() => {
						closeModal();
						queryClient.invalidateQueries({ queryKey: ["subContractorCrews"] });
					}}
					description={tSub.crewCreatedDescription}
					subDescription={name}
					leftDescription={tSub.crewReflectInTable}
					buttonText={tSub.okay}
				/>
			),
		});
	};

	return (
		<>
			<Button
				variant="filled"
				className="h-10 w-full sm:w-auto"
				onClick={() =>
					openModal({
						modalTitle: tSub.createNewCrew,
						modalView: (
							<CreateSubContractorCrewModal
								closeModal={closeModal}
								handleSuccessfulCrewCreation={handleSuccessfulCrewCreation}
							/>
						),
						variant: "medium",
					})
				}
			>
				{tSub.createNewCrew}
			</Button>
			<Modal />
		</>
	);
};

export default CreateSubContractorNewCrewTrigger;
