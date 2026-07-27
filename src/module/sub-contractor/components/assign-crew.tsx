import { Button } from "@/components/ui/button";
import { IAuthStore } from "@/module/profile/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface IAssignCrew {
	handleAssignCrew: () => void;
	subContractorType: IAuthStore;
}

export const AssignCrew = ({ handleAssignCrew, subContractorType }: IAssignCrew) => {
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	return subContractorType?.user?.id ? (
		<div className="px-4">
			<Button className="w-full" variant="outline" onClick={() => handleAssignCrew()}>
				{tSub.assignCrew}
			</Button>
		</div>
	) : (
		<></>
	);
};
