"use client";

import { useRef, useState } from "react";
import { useModal } from "@/hooks/useModal";
import { IUploadImage } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { ISubContractorDailyJobDetailsResponse } from "@/module/sub-contractor/types";
import { useUpdateSubContractorDailyJobRecord } from "../hooks/useSubContractorJobSchedule";
import { Button } from "@/components/ui/button";
import ImageUpload from "@/components/shared/image-upload/image-upload";
import { useHandleFileUpload } from "@/hooks/useFile";
import { IAuthStore } from "@/module/profile/types";
import { SubContractorJobUpdateModalContent } from "./sub-contractor-job-update-modal-content";
import { openErrorToast } from "@/components/toast";
import { dateToUTCString } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const SubContractorJobUpdateForm = ({
	job,
	onUpdate,
	onClose,
	subContractorType,
}: {
	job: ISubContractorDailyJobDetailsResponse;
	onUpdate: () => void;
	onClose: () => void;
	subContractorType: IAuthStore;
}) => {
	const isMarkedAsNotReady = job.notReadyUpdate?.isReady == false;

	const [jobCompleted, setJobCompleted] = useState<boolean | null>(
		isMarkedAsNotReady ? false : (job.isJobFinishToday ?? null)
	);
	const [completionDate, setCompletionDate] = useState(job.subContractorJobUpdate?.forecastDate || "");
	const [note, setNote] = useState<string | undefined>();
	const [images, setImages] = useState<IUploadImage[]>(job?.images || []);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { mutate: updateDailyJob, isPending } = useUpdateSubContractorDailyJobRecord(
		job.id,
		subContractorType?.user,
		subContractorType?.subcontractorCrew
	);
	const { openModal, closeModal, Modal } = useModal();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const handleRefetch = () => {
		onUpdate();
		onClose();
		closeModal();
	};

	const handleSubmit = async () => {
		if (jobCompleted === null) {
			openErrorToast({ message: "Please select job completion status." });
			return;
		}

		if (!jobCompleted) {
			if (jobCompleted === false && !completionDate) {
				openErrorToast({ message: "Completion date is required." });
				return;
			}

			if (job?.date) {
				const jobDate = new Date(job.date).setHours(0, 0, 0, 0);
				const completion = new Date(completionDate).setHours(0, 0, 0, 0);

				if (completion < jobDate) {
					openErrorToast({ message: "Completion date cannot be earlier than the job creation date." });
					return;
				}
			}
		}
		const filesToUpload = getFilesToUpload(images);
		const signedUrls = await getSignedUrls(filesToUpload);

		const updateData = {
			...job,
			isJobFinishToday: jobCompleted,
			subContractorJobUpdate: job?.subContractorJobUpdate
				? {
						...job?.subContractorJobUpdate,
						forecastDate: completionDate ? dateToUTCString(completionDate) : completionDate,
					}
				: {
						forecastDate: completionDate ? dateToUTCString(completionDate) : completionDate,
					},
			note,
			images: images?.map((image) => ({
				keyFile: image.keyFile || "",
				url: image.url,
			})),
		};

		updateDailyJob(updateData, {
			onSuccess: async () => {
				await handleFileUpload({ signedUrls, filesToUpload });
				openModal({
					modalTitle: "Job Updated Successfully",
					modalView: (
						<Button variant={"filled"} className="w-full" onClick={handleRefetch}>
							Okay
						</Button>
					),
				});
			},
		});
	};

	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<>
			<SubContractorJobUpdateModalContent
				jobCompleted={jobCompleted}
				setJobCompleted={setJobCompleted}
				completionDate={completionDate}
				setCompletionDate={setCompletionDate}
				note={note}
				setNote={setNote}
				onSubmit={handleSubmit}
				fileInputRef={fileInputRef}
				actrec={job?.actrec}
				jobUpdateReasons={job.jobUpdateReasons}
				isMarkedAsNotReady={isMarkedAsNotReady}
			/>

			{!jobCompleted && (
				<div className="my-2 w-full flex-1 px-2">
					<ImageUpload
						value={images}
						onChange={setImages}
						label={tEmployee.addImages}
						labelClassName="font-inter text-sm font-medium text-brand-dark60"
					/>
				</div>
			)}
			<Button
				onClick={handleSubmit}
				loading={isPending}
				loadingText="Submitting..."
				className="my-4 h-10 w-full bg-black text-lg font-semibold text-white hover:bg-gray-800"
				disabled={isPending || jobCompleted === null || (jobCompleted === false && !completionDate)}
			>
				{tEmployee.submit}
			</Button>

			<Modal />
		</>
	);
};

export default SubContractorJobUpdateForm;
