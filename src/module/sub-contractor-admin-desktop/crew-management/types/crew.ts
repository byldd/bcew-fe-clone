import { ISubContractorCrew } from "@/module/admin-sub-contractor/types";

export interface UpdateSubContractorCrewDesktopFormProps {
	onClose: () => void;
	crew: ISubContractorCrew;
	handleSuccessfulCrewUpdate: () => void;
}

export interface CreateSubContractorCrewModalProps {
	closeModal: () => void;
	handleSuccessfulCrewCreation: (name: string) => void;
}
