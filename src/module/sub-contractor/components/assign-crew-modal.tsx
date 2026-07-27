import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/selectField";
import { useSubContractorCrewsNames } from "@/module/sub-contractor/hooks/useSubContractorJobSchedule";
import { ISubContractorCrewName } from "@/module/sub-contractor/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface IAssignCrewModalProps {
	alreadyAssignedCrew: string | undefined;
	handleOpenCreateSubContractorCrewModal: () => void;
	handleAssignDailyJobCrew: (crewId: string) => void;
}

export const AssignCrewModal = ({
	alreadyAssignedCrew,
	handleOpenCreateSubContractorCrewModal,
	handleAssignDailyJobCrew,
}: IAssignCrewModalProps) => {
	const { data: crews } = useSubContractorCrewsNames();
	const [selectedCrewId, setSelectedCrewId] = useState<string>("");
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	useEffect(() => {
		if (alreadyAssignedCrew) {
			setSelectedCrewId(alreadyAssignedCrew);
		}
	}, [alreadyAssignedCrew]);

	return (
		<div className="w-full space-y-4 rounded-md bg-white p-0 shadow-md">
			{crews && crews?.length > 0 && (
				<SelectField
					label={tSub.selectCrew}
					placeholder={tSub.selectLeader}
					options={crews?.map((crew: ISubContractorCrewName) => ({
						label: crew.name,
						value: crew.id,
					}))}
					value={selectedCrewId}
					onValueChange={setSelectedCrewId}
				/>
			)}

			<Button
				className="w-full"
				variant={"outline"}
				onClick={() => {
					// Open create crew modal
					handleOpenCreateSubContractorCrewModal();
				}}
			>
				{tSub.createNew}
			</Button>

			<Button
				className="w-full"
				variant="filled"
				onClick={() => handleAssignDailyJobCrew(selectedCrewId)}
				disabled={!selectedCrewId}
			>
				{tSub.assignCrew}
			</Button>
		</div>
	);
};
