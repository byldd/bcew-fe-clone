import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import React from "react";
import CreateCrewModal from "@/module/crew/components/create-crew-modal";
import SuccessModal from "@/components/success-modal";
import { useQueryClient } from "@tanstack/react-query";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
import { MODULE } from "@/utils/enums";

const CreateNewCrewTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();
	const queryClient = useQueryClient();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const handleSuccessfulCrewCreation = (name: string) => {
		openModal({
			modalTitle: tPmanagement.crewCreated,
			modalView: (
				<SuccessModal
					closeModal={() => {
						closeModal();
						queryClient.invalidateQueries({ queryKey: ["crews"] });
					}}
					description={tPmanagement.crewCreatedSuccessfully}
					subDescription={name}
					leftDescription={tPmanagement.crewWillReflectInManagementTable}
					buttonText={tPmanagement.okay}
				/>
			),
		});
	};

	return (
		<WriteAccessWrapper moduleName={MODULE.CREW_LIST}>
			<div>
				<Button
					variant="filled"
					className="h-10"
					onClick={() =>
						openModal({
							modalTitle: tPmanagement.createNewCrew,
							modalView: (
								<CreateCrewModal closeModal={closeModal} handleSuccessfulCrewCreation={handleSuccessfulCrewCreation} />
							),
							variant: "medium",
						})
					}
				>
					{tPmanagement.createNewCrew}
				</Button>
				<Modal />
			</div>
		</WriteAccessWrapper>
	);
};

export default CreateNewCrewTrigger;
