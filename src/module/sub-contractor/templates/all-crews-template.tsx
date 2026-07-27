"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import CreateCrewForm from "@/module/sub-contractor/components/create-crew-form";
import CrewCard from "@/module/sub-contractor/components/crew-card";
import { useSubContractorCrews } from "@/module/sub-contractor/hooks/useSubContractorCrew";
import { UpdateSubContractorCrewForm } from "@/module/sub-contractor/components/update-crew-form";
import { ISubContractorCrew } from "@/module/admin-sub-contractor/types";
import { DeleteSubContractorCrew } from "@/module/sub-contractor/components/delete-crew";
import { Spinner } from "@/components/ui/spinner";
import useAuthStore from "@/store/auth-store";
import CrewStatusTab from "@/module/admin-sub-contractor/components/crew-status-tab";
import { useSubContractorCrewsParams } from "@/module/admin-sub-contractor/hooks/useSubContractorCrewsParams";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import BackButton from "@/components/common/back-button";

export default function AllCrewsTemplate() {
	const { getParams, setParams } = useSubContractorCrewsParams();
	const { openModal, closeModal, Modal } = useModal();

	const { crewStatus } = getParams();
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const { user, subcontractorCrew } = useAuthStore((state) => state);

	const { data, isPending, refetch } = useSubContractorCrews(user, subcontractorCrew, { crewStatus });

	const { crews } = data ?? {};

	const handleDelete = (id: string, name: string) => {
		openModal({
			modalTitle: `Delete Crew '${name}'`,
			modalView: <DeleteSubContractorCrew onClose={closeModal} crewId={id} crewName={name} />,
		});
	};

	const handleEdit = (crew: ISubContractorCrew) => {
		openModal({
			modalTitle: tSub.updateCrew,
			modalView: <UpdateSubContractorCrewForm onClose={closeModal} crew={crew} />,
		});
	};

	if (isPending) return <Spinner />;

	return (
		<div className="min-h-screen bg-brand-bgLightgrey shadow-md">
			{/* Mount modal portal at very top */}
			<Modal />

			<div className="min-h-screen min-w-full">
				{/* Header */}
				<div className="fixed top-0 z-10 flex w-[calc(100%-32px)] items-center gap-3 bg-brand-bgLightgrey">
					<div className="flex items-center gap-1 px-2">
						<BackButton />
						<div className="flex-col space-y-1 pt-4">
							<div className="font-inter text-base font-semibold text-brand-dark">{tSub.allCrews}</div>
							<div className="font-inter text-xs font-bold text-brand-dark50">
								{user?.name || subcontractorCrew?.subcontractor?.user?.name || "--"}
							</div>
						</div>
					</div>

					<div className="absolute right-0">
						<CrewStatusTab activeTab={crewStatus} onChange={(tab) => setParams({ crewStatus: tab, page: 1 })} />
					</div>
				</div>

				{/* Crew Cards */}
				<div className="space-y-4 px-4 py-20">
					{crews && crews?.length > 0 ? (
						crews.map((crew) => (
							<CrewCard
								key={crew.id}
								{...crew}
								onEdit={() => handleEdit(crew)}
								onDelete={() => handleDelete(crew.id, crew.name)}
							/>
						))
					) : (
						<div>{tSub.noCrewsFound}</div>
					)}
				</div>

				{/* Add New Crew Button */}
				<div className="fixed bottom-0 left-0 w-full bg-brand-bgLightgrey p-4">
					{user?.id && (
						<Button
							variant="filled"
							className="w-full rounded-[10px] font-inter text-base font-semibold"
							onClick={() =>
								openModal({
									modalTitle: tSub.createNewCrew,
									modalView: <CreateCrewForm onClose={closeModal} refetch={refetch} />,
								})
							}
						>
							{tSub.addNewCrew}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
