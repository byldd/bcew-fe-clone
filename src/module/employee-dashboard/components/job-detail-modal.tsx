// hooks/use-job-detail-modal.ts
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Job, JobStatus } from "@/module/employee-dashboard/types";
import { statusIcons } from "@/module/employee-dashboard/constants/job-status-icons";
import { routes } from "@/config/routes";

import { JobDetailModalContent } from "@/module/employee-dashboard/components/job-detail-modal-content";
import { useModal } from "@/hooks/useModal";
import { legends } from "../constants/legend-items";

export function useJobDetailModal() {
	const { openModal, closeModal, Modal } = useModal();

	const [homeReady, setHomeReady] = useState<string>("");
	const [homeClean, setHomeClean] = useState<string>("");
	const [note, setNote] = useState("");
	const [images, setImages] = useState<File[]>([]);
	const [showNotReadyConfirm, setShowNotReadyConfirm] = useState(false);
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null!);

	const openJobDetailModal = (job: Job, onUpdate: (jobId: string, updates: Partial<Job>) => void) => {
		resetForm();

		openModal({
			modalTitle: (
				<div className="flex items-center gap-2">
					<span>
						{job.jobId} ({job.jobStatusLabel})
					</span>
					{getStatusIcon(job)}
				</div>
			),
			subHeader: <span>New Start Job</span>,
			modalView: <JobDetailForm job={job} onUpdate={onUpdate} />,
			variant: "default",
			showDefaultClose: true,
		});
	};

	const resetForm = () => {
		setHomeReady("");
		setHomeClean("");
		setNote("");
		setImages([]);
		setShowNotReadyConfirm(false);
	};

	const getStatusIcon = (job: Job) => {
		const showWaitingForConfirmation = job.status === legends.jobNotReady && job.confirmationRequired;
		return showWaitingForConfirmation && job.previousStatus
			? statusIcons[job.previousStatus as keyof typeof statusIcons]
			: statusIcons[job.status as keyof typeof statusIcons];
	};

	const JobDetailForm = ({ job, onUpdate }: { job: Job; onUpdate: (jobId: string, updates: Partial<Job>) => void }) => {
		const isServiceJob = job.jobStatusLabel.toLowerCase() === "service";
		const isRoughJob = job.jobStatusLabel.toLowerCase() === "rough";
		const shouldShowImageUpload = isRoughJob ? homeReady === "No" && homeClean === "No" : homeReady === "No";

		const handleUpdate = () => {
			if (isServiceJob && homeReady === "Yes") {
				router.push(routes.employee.job(job.id));
				closeModal();
				return;
			}
			if (isRoughJob && homeReady === "No" && homeClean === "No") {
				setShowNotReadyConfirm(true);
				return;
			}
			if (!isServiceJob && !isRoughJob && homeReady === "No") {
				setShowNotReadyConfirm(true);
				return;
			}
			onUpdate(job.id, { homeReady, homeClean, note, images });
			closeModal();
		};

		const handleFinalSubmit = () => {
			onUpdate(job.id, {
				status: "not-ready" as JobStatus,
				homeReady,
				homeClean,
				note,
				images,
			});
			closeModal();
		};

		const handleImageAdd = (e?: React.ChangeEvent<HTMLInputElement>) => {
			if (e?.target?.files && e.target.files[0]) {
				setImages([...images, e.target.files[0]]);
			}
		};

		const handleDeleteImage = (index: number) => {
			const updated = images.filter((_, i) => i !== index);
			setImages(updated);
		};

		return (
			<JobDetailModalContent
				job={job}
				homeReady={homeReady}
				setHomeReady={setHomeReady}
				homeClean={homeClean}
				setHomeClean={setHomeClean}
				note={note}
				setNote={setNote}
				images={images}
				setImages={setImages}
				shouldShowImageUpload={shouldShowImageUpload}
				showNotReadyConfirm={showNotReadyConfirm}
				setShowNotReadyConfirm={setShowNotReadyConfirm}
				onCancel={closeModal}
				onUpdate={handleUpdate}
				onFinalSubmit={handleFinalSubmit}
				fileInputRef={fileInputRef}
				handleImageAdd={handleImageAdd}
				handleDeleteImage={handleDeleteImage}
			/>
		);
	};
	// TODO: handel JobDetailmodalContent props properly
	return {
		openJobDetailModal,
		closeJobDetailModal: closeModal,
		JobDetailModal: Modal,
	};
}
