import { Button } from "@/components/ui/button";
import {
	useDeleteSubContractorCrew,
	useGetSubContractorCrewJobs,
} from "@/module/sub-contractor/hooks/useSubContractorCrew";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Spinner } from "@/components/ui/spinner";
import { getTodayDate, toMidnightDateString } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type IDeleteSubContractorCrewProps = {
	onClose: () => void;
	crewId: string;
	crewName: string;
};

export const DeleteSubContractorCrew = ({ onClose, crewId, crewName }: IDeleteSubContractorCrewProps) => {
	const { mutate: deleteSubContractorCrew, isPending } = useDeleteSubContractorCrew();
	const { data, isLoading } = useGetSubContractorCrewJobs({
		subcontractorCrewId: crewId,
		startDate: toMidnightDateString(getTodayDate()),
	});
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const jobNames = data?.map((job) => job.actrec.jobnme) || [];

	const queryClient = useQueryClient();

	const handleDeleteSubContractorCrew = (id: string) => {
		deleteSubContractorCrew(id, {
			onSuccess: (res) => {
				queryClient.invalidateQueries({ queryKey: ["subContractorCrews"] });
				openSuccessToast(
					<span>
						{tSub.crew} <span className="font-semibold">{res.data?.item?.name}</span> {tSub.crewDeletedSuccessfully}
					</span>
				);
				onClose();
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-4">
				<Spinner />
			</div>
		);
	}
	return (
		<div>
			<div className="flex flex-col gap-2 font-inter text-sm font-medium text-brand-dark60">
				{jobNames?.length > 0 ? (
					<p>
						The crew <span className="font-inter text-sm font-semibold text-brand-dark">{crewName}</span> is currently
						assigned to the following {jobNames?.length > 1 ? "jobs" : "job"} :{" "}
						<span className="font-inter text-sm font-semibold text-brand-dark">
							{jobNames?.slice(0, 3)?.join(", ") + (jobNames?.length > 3 ? `+${jobNames?.length - 3}` : "")}
						</span>
						. Deleting this crew may affect these assignments. Do you still want to delete this crew?
					</p>
				) : (
					<p>{tSub.deleteCrewConfirmation}</p>
				)}
			</div>
			<div className="mt-6 flex flex-col gap-2">
				<Button className="w-full" variant="outline" onClick={onClose}>
					{tSub.cancel}
				</Button>
				<Button
					variant="filled"
					className="w-full !bg-brand-red"
					onClick={() => {
						handleDeleteSubContractorCrew(crewId);
					}}
					loading={isPending}
				>
					{tSub.delete}
				</Button>
			</div>
		</div>
	);
};
