import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { CreateNewRoleModal } from "@/module/employee/components/create-new-role-modal";
import { useQueryClient } from "@tanstack/react-query";
import SuccessModal from "@/components/success-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const CreateNewRoleTriggerModal = () => {
	const { openModal, closeModal, Modal } = useModal();
	const queryClient = useQueryClient();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const handleSuccessfulRoleCreation = (name: string) => {
		openModal({
			variant: "medium",

			modalView: (
				<SuccessModal
					closeModal={() => {
						closeModal();
						queryClient.invalidateQueries({ queryKey: ["rolesWithPermissions"] });
					}}
					description={tPmanagement.roleCreatedSuccessfully}
					subDescription={name}
					leftDescription={tPmanagement.role}
					buttonText={tPmanagement.okay}
				/>
			),
		});
	};
	return (
		<>
			<Button
				onClick={() =>
					openModal({
						variant: "medium",
						modalTitle: tPmanagement.roleAndAccess,
						modalView: (
							<CreateNewRoleModal onClose={closeModal} handleSuccessfulRoleCreation={handleSuccessfulRoleCreation} />
						),
					})
				}
				variant={"filled"}
				className="w-fit"
			>
				{tPmanagement.createNewRole}
			</Button>
			<Modal />
		</>
	);
};
export default CreateNewRoleTriggerModal;
