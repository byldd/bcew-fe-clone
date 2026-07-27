import { Button } from "@/components/ui/button";
import { ICrewWithDetails } from "@/module/crew/types";
import { useDeleteCrew } from "@/module/crew/hooks/useCrew";
import { openErrorToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface DeleteCrewModalProps {
	onClose: () => void;
	crew: ICrewWithDetails;
	handleSuccessfulCrewDelete: () => void;
}

const DeleteCrewModal: React.FC<DeleteCrewModalProps> = ({ onClose, crew, handleSuccessfulCrewDelete }) => {
	const deleteCrewMutation = useDeleteCrew();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const handleDeleteCrew = () => {
		deleteCrewMutation.mutate(crew.id, {
			onSuccess: () => {
				handleSuccessfulCrewDelete(); // open the success modal
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<div>
			{/* Header */}

			<p className="text-sm text-brand-dark50">{tPmanagement.deleteCrewWarning}</p>

			{/* Actions */}
			<div className="mt-6 flex justify-end gap-4">
				<Button variant={"outline"} onClick={onClose} className="w-full">
					{tCommon.cancel}
				</Button>
				<Button variant={"filled"} onClick={handleDeleteCrew} className="w-full bg-brand-red hover:bg-red-600">
					{tPmanagement.delete}
				</Button>
			</div>
		</div>
	);
};

export default DeleteCrewModal;
