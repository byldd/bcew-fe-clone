import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import EmployeeEditModal from "./employee-edit-modal";
import { IEmployeeDetailsResponse } from "@/module/employee/types";
import { FiEdit } from "react-icons/fi";
import { CardTitle } from "@/components/ui/card";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
import { MODULE } from "@/utils/enums";

interface Props {
	employee: IEmployeeDetailsResponse;
}
const EmployeeEditModalTrigger = ({ employee }: Props) => {
	const { openModal, closeModal, Modal } = useModal();
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	return (
		<>
			<WriteAccessWrapper moduleName={MODULE.EMPLOYEES_LIST}>
				<>
					<Button
						onClick={() =>
							openModal({
								modalTitle: (
									<CardTitle className="flex items-center justify-between text-xl font-semibold">
										<div>{tPeople.personalInformation}</div>
									</CardTitle>
								),
								modalView: <EmployeeEditModal onClose={closeModal} employee={employee} />,
								variant: "medium",
							})
						}
						variant={"ghost"}
						size={"icon"}
						className="size-8"
					>
						<FiEdit className="!size-5" />
					</Button>
					<Modal />
				</>
			</WriteAccessWrapper>
		</>
	);
};
export default EmployeeEditModalTrigger;
