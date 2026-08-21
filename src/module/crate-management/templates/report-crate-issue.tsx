"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { openErrorToast } from "@/components/toast";
import { routes } from "@/config/routes";
import { useHandleFileUpload } from "@/hooks/useFile";
import { dateToUTCString, getTodayDate } from "@/lib/utils/date";
import { useEmployeeSchedules } from "@/module/job/hooks/useEmployeeSchedule";
import type { IFileUploadable } from "@/types/file-upload";
import IssueCategoryPicker from "../components/issue-category-picker";
import PhotoGrid from "../components/photo-grid";
import ReportIssueSuccess from "../components/report-issue-success";
import ScreenHeader from "../components/screen-header";
import { CRATE_ISSUE_CATEGORY, CRATE_ISSUE_SEVERITY } from "../enums";
import { useReportCrateIssue } from "../hooks/useCrateManagement";
import { ICrateIssueReportSummary } from "../types";
import { CRATE_ISSUE_SEVERITY_OPTIONS } from "../utils/constants";

const NO_TASK_KEY = "none";

function getJobTaskKey(recnum: number, tsknum: number | null): string {
	return `${recnum}-${tsknum ?? NO_TASK_KEY}`;
}

export default function ReportCrateIssueTemplate() {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [crateId, setCrateId] = useState("");
	const [jobDate, setJobDate] = useState<Date>(() => getTodayDate());
	const [jobNum, setJobNum] = useState<number | "">("");
	const [taskNum, setTaskNum] = useState<number | null>(null);
	const [category, setCategory] = useState<CRATE_ISSUE_CATEGORY | null>(null);
	const [severity, setSeverity] = useState<CRATE_ISSUE_SEVERITY | "">("");
	const [photos, setPhotos] = useState<File[]>([]);
	const [description, setDescription] = useState("");
	const [report, setReport] = useState<ICrateIssueReportSummary | null>(null);

	const { data: scheduleJobs } = useEmployeeSchedules({ startDate: dateToUTCString(jobDate) });
	const { getFilesToUpload, getSignedUrls, handleFileUpload } = useHandleFileUpload();
	const { mutateAsync: reportIssue, isPending } = useReportCrateIssue();

	const jobOptions = Array.from(
		new Map(
			(scheduleJobs ?? [])
				.filter((job) => job.jobDailyRecord.recnum !== null && job.jobDailyRecord.recnum !== undefined)
				.map((job) => [getJobTaskKey(job.jobDailyRecord.recnum, job.jobDailyRecord.tsknum), job.jobDailyRecord])
		).values()
	);

	const isCrateIdRequired = category !== CRATE_ISSUE_CATEGORY.NO_CRATE;

	const handleCategoryChange = (value: CRATE_ISSUE_CATEGORY) => {
		setCategory(value);
		if (value === CRATE_ISSUE_CATEGORY.NO_CRATE) {
			setCrateId("");
		}
	};

	const handleJobDateChange = (date: Date) => {
		setJobDate(date);
		setJobNum("");
		setTaskNum(null);
	};

	const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = "";
		if (files.length === 0) return;
		setPhotos((prev) => [...prev, ...files]);
	};

	const removePhoto = (index: number) => {
		setPhotos((prev) => prev.filter((_, i) => i !== index));
	};

	const isSubmitDisabled =
		!category || !jobNum || !taskNum || (isCrateIdRequired && !crateId.trim()) || !severity || !description.trim();

	const handleSubmit = async () => {
		if (isSubmitDisabled || !category || !severity || !jobNum || !taskNum) return;

		try {
			const uploadable: IFileUploadable[] = photos.map((file) => ({
				keyFile: `${file.name}-${Date.now()}`,
				file,
				url: URL.createObjectURL(file),
			}));

			const filesToUpload = getFilesToUpload(uploadable);
			let uploadedPhotos: { keyFile: string; url: string }[] = [];

			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
				uploadedPhotos = signedUrls.map(({ keyFile, url }) => ({ keyFile, url }));
			}

			const summary = await reportIssue({
				crateId: isCrateIdRequired ? crateId.trim() : undefined,
				jobNum,
				taskNum,
				category,
				severity,
				description: description.trim(),
				photos: uploadedPhotos,
			});

			setReport(summary);
		} catch (error) {
			openErrorToast({ error: error as Error, message: "Failed to submit report. Please try again." });
		}
	};

	if (report) {
		return <ReportIssueSuccess report={report} onDone={() => router.push(routes.employee.crateManagement)} />;
	}

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey">
			<ScreenHeader title="Report Issue" />

			<div className="flex flex-1 flex-col gap-4 px-4">
				<IssueCategoryPicker value={category} onChange={handleCategoryChange} />

				<div className="flex flex-col gap-1.5">
					<FormLabelRequired label="Select Job Date" required />
					<DatePicker value={jobDate} onChange={handleJobDateChange} className="bg-white" />
				</div>

				<div className="flex flex-col gap-1.5">
					<FormLabelRequired label="Select Job" required />
					<Select
						value={jobNum === "" ? "" : getJobTaskKey(jobNum, taskNum)}
						onValueChange={(value) => {
							const [recnumStr, taskStr] = value.split("-");
							setJobNum(Number(recnumStr));
							setTaskNum(taskStr === NO_TASK_KEY ? null : Number(taskStr));
						}}
					>
						<SelectTrigger className="bg-white">
							<SelectValue placeholder="Select job" />
						</SelectTrigger>
						<SelectContent>
							{jobOptions.length === 0 ? (
								<p className="px-2 py-1.5 text-sm text-gray-400">No job found for this date</p>
							) : (
								jobOptions.map((job) => (
									<SelectItem key={getJobTaskKey(job.recnum, job.tsknum)} value={getJobTaskKey(job.recnum, job.tsknum)}>
										{job.jobnme}
										{job.tsknme ? ` (${job.tsknme})` : ""}
									</SelectItem>
								))
							)}
						</SelectContent>
					</Select>
				</div>

				{category && isCrateIdRequired && (
					<div className="flex flex-col gap-1.5">
						<FormLabelRequired label="Crate ID" required htmlFor="issue-crate-id" />
						<Input
							id="issue-crate-id"
							type="text"
							inputMode="numeric"
							value={crateId}
							onChange={(e) => setCrateId(e.target.value.replace(/\D/g, ""))}
							placeholder="123456"
							className="h-auto w-full rounded-xl text-sm"
							autoComplete="off"
						/>
					</div>
				)}

				<div className="flex flex-col gap-1.5">
					<FormLabelRequired label="Severity" required />
					<Select value={severity} onValueChange={(value) => setSeverity(value as CRATE_ISSUE_SEVERITY)}>
						<SelectTrigger className="bg-white">
							<SelectValue placeholder="Select" />
						</SelectTrigger>
						<SelectContent>
							{CRATE_ISSUE_SEVERITY_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-1.5">
					<FormLabelRequired label="Photo" />
					<Button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-gray-300 bg-white py-8 text-gray-400 transition-colors active:bg-gray-50"
					>
						<Camera className="h-6 w-6" />
						<span className="text-sm">Tap to take photo</span>
					</Button>
					<Input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						className="hidden"
						onChange={handleFilesSelected}
					/>
					{photos.length > 0 && (
						<div>
							<PhotoGrid photos={photos} onRemove={removePhoto} />
						</div>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<FormLabelRequired label="Note" required htmlFor="issue-note" />
					<Textarea
						id="issue-note"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Add details"
						className="min-h-[80px] rounded-[8px] border bg-brand-bgLightgrey04 text-sm"
					/>
				</div>
			</div>

			<div className="flex gap-2 px-4 pb-8 pt-4">
				<Button type="button" variant="outline" onClick={() => router.back()} className="h-10 w-full">
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					onClick={handleSubmit}
					disabled={isSubmitDisabled}
					loading={isPending}
					loadingText="Submitting..."
					className="h-10 w-full"
				>
					Submit Report
				</Button>
			</div>
		</div>
	);
}
