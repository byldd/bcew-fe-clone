"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRef, useState } from "react";
import ReportIssueSuccessModal from "./report-issue-success-modal";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useCreateTechnicalIssue } from "../../hooks/useTechnicalIssues";
import { useHandleFileUpload } from "@/hooks/useFile";
import { openErrorToast, openSuccessToast } from "@/components/toast";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getReportTechnicalIssueSchema, ReportTechnicalIssueFormType } from "../../utils/report-technical-issue-schema";
import { TECHNICAL_ISSUE_SEVERITY, TECHNICAL_ISSUE_TYPE } from "@/utils/enums";
import { TECHNICAL_ISSUE_SEVERITY_LABEL_MAP } from "@/module/admin-technical-issues/constants";
import FormError from "@/components/ui/form-error";
import { useQueryClient } from "@tanstack/react-query";
import { getTechnicalIssueTypeLabel } from "@/module/admin-technical-issues/helpers";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { IFileUploadable } from "@/types/file-upload";
import { AxiosError } from "axios";

export interface IEditIssuePayload {
	issueType: TECHNICAL_ISSUE_TYPE;
	description: string;
	screenshots: { keyFile: string }[];
}

export interface IEditIssue {
	id: string;
	defaultValues: {
		issueType: TECHNICAL_ISSUE_TYPE;
		description: string;
		images: IFileUploadable[];
	};
	onSave: (payload: IEditIssuePayload) => Promise<void>;
}

export default function ReportTechnicalIssue({
	onClose,
	openModal,
	isTechnician = false,
	editIssue,
}: {
	onClose: () => void;
	openModal: (params: { modalTitle?: string; modalView: React.ReactNode }) => void;
	isTechnician?: boolean;
	editIssue?: IEditIssue;
}) {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	// Severity is shown only on create for Asana-enabled users.
	// It is never editable — it is set on creation and locked when the issue is classified.
	const showSeverity = !editIssue && (user?.isAsanaEnabled ?? false);
	const isEditMode = !!editIssue;
	const router = useRouter();

	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	const queryClient = useQueryClient();

	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const { mutate: createIssue, isPending: isCreating } = useCreateTechnicalIssue(user, subcontractorCrew);
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const isPending = isCreating || isUpdating;

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
	} = useForm<ReportTechnicalIssueFormType>({
		resolver: zodResolver(getReportTechnicalIssueSchema(showSeverity)),
		defaultValues: editIssue
			? { ...editIssue.defaultValues, severity: undefined }
			: {
					issueType: undefined,
					description: "",
					images: [],
					severity: undefined,
				},
	});

	const images = watch("images") || [];

	const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const newFiles = Array.from(files).map((file) => ({
			keyFile: `${file.name}-${Date.now()}`,
			file,
			url: URL.createObjectURL(file),
		}));

		setValue("images", [...images, ...newFiles]);
		e.target.value = "";
	};

	const handleDeleteImage = (index: number) => {
		setValue(
			"images",
			images.filter((_, i) => i !== index)
		);
	};

	const onSubmit = async (data: ReportTechnicalIssueFormType) => {
		if (!user && !subcontractorCrew) {
			openErrorToast({
				message: tAdmin.notAuthorizedToReportIssue,
			});
			return;
		}

		const filesToUpload = getFilesToUpload(data.images || []);
		const signedUrls = await getSignedUrls(filesToUpload);

		if (isEditMode) {
			// Full desired screenshot list (existing + new), keyed by keyFile.
			const allScreenshots = (data.images || []).map((img) => ({ keyFile: img.keyFile }));

			setIsUpdating(true);
			try {
				await editIssue.onSave({
					issueType: data.issueType,
					description: data.description,
					screenshots: allScreenshots,
				});
				await handleFileUpload({ signedUrls, filesToUpload });
				openSuccessToast("Issue updated successfully");
				onClose();
			} catch (error) {
				openErrorToast({
					error: error as AxiosError<{ message: string }>,
				});
			} finally {
				setIsUpdating(false);
			}
			return;
		}

		const payload = {
			issueType: data.issueType,
			description: data.description,
			screenshots: filesToUpload.map((file) => ({
				keyFile: file.keyFile || "",
				url: file.url,
			})),
			...(showSeverity && data.severity ? { severity: data.severity } : {}),
		};

		createIssue(payload, {
			onSuccess: async (res) => {
				await handleFileUpload({ signedUrls, filesToUpload });

				if (!isTechnician) {
					queryClient.invalidateQueries({ queryKey: ["admin-technical-issues"] });
				}

				openModal({
					modalTitle: tAdmin.issueReportedSuccessfully,
					modalView: <ReportIssueSuccessModal referenceId={res?.ticketNumber?.toString()} onDone={onClose} />,
				});
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const redirectToRespectiveTechnicalIssuesPage = (userType: ROLES | undefined) => {
		switch (userType) {
			case ROLES.ADMIN:
				router.push(routes.employee.technicalIssue);
				break;

			case ROLES.TECHNICIAN_EMPLOYEE:
				router.push(routes.employee.technicalIssue);
				break;

			case ROLES.SUB_CONTRACTOR:
				router.push(routes.subContractor.adminTechnicalIssue);
				break;

			case ROLES.SUB_CONTRACTOR_CREW_LEADER:
				router.push(routes.subContractor.crewLeaderTechnicalIssue);
				break;

			default:
				openErrorToast({
					message: "Invalid user role",
				});
		}
	};

	const descriptionLength = watch("description")?.length || 0;

	return (
		<div className="flex max-h-[100vh] flex-col rounded-[10px] bg-white">
			{/* Header */}
			<>
				{isTechnician && (
					<div className="mb-4 flex items-center justify-between">
						<p className="text-lg">Submit an Issue</p>
						<Button
							type="button"
							variant="filled"
							className="mr-2 h-7 w-[90px] rounded-[8px] text-xs"
							onClick={() => {
								onClose();
								if (!user && !subcontractorCrew) return;

								redirectToRespectiveTechnicalIssuesPage(
									subcontractorCrew ? ROLES.SUB_CONTRACTOR_CREW_LEADER : user?.userType
								);
							}}
						>
							{tAdmin.trackIssues}
						</Button>
					</div>
				)}
			</>
			<div className="flex-1 space-y-3 overflow-y-auto">
				<p className="text-sm text-brand-dark">{tAdmin.describeIssueHelpResolve}</p>

				<div className="space-y-2">
					<p className="text-sm text-brand-grey">{tAdmin.selectIssue}</p>
					<Controller
						name="issueType"
						control={control}
						render={({ field }) => (
							<RadioGroup value={field.value} onValueChange={field.onChange}>
								{Object.values(TECHNICAL_ISSUE_TYPE).map((type) => (
									<div key={type} className="flex items-start gap-2">
										<RadioGroupItem value={type} id={type} className="mt-0.5" />
										<Label className="text-sm" htmlFor={type}>
											{getTechnicalIssueTypeLabel(type)}
										</Label>
									</div>
								))}
							</RadioGroup>
						)}
					/>
					<FormError error={errors.issueType?.message} />
				</div>
				<div className="space-y-1">
					<p className="text-sm text-brand-grey">{tAdmin.whatWentWrong}</p>

					<Controller
						name="description"
						control={control}
						render={({ field }) => (
							<div className="px-0.5">
								<Textarea
									{...field}
									maxLength={2000}
									rows={4}
									placeholder={tAdmin.describeIssueBriefly}
									className="rounded-[10px] border-none bg-brand-bgLightgrey text-xs"
								/>
								<div className="mt-1 flex justify-between gap-2">
									<FormError error={errors.description?.message} />
									<p className="justify-end text-right text-xs text-muted-foreground">{descriptionLength}/2000</p>
								</div>
							</div>
						)}
					/>
				</div>
				{showSeverity && (
					<div className="space-y-2">
						<p className="text-sm text-brand-grey">Set Severity</p>
						<Controller
							name="severity"
							control={control}
							render={({ field }) => (
								<RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
									{Object.values(TECHNICAL_ISSUE_SEVERITY).map((severity) => (
										<div key={severity} className="flex items-center gap-2">
											<RadioGroupItem value={severity} id={`severity-${severity}`} />
											<Label className="text-sm" htmlFor={`severity-${severity}`}>
												{TECHNICAL_ISSUE_SEVERITY_LABEL_MAP[severity]}
											</Label>
										</div>
									))}
								</RadioGroup>
							)}
						/>
						<FormError error={errors.severity?.message} />
					</div>
				)}
				<div className="space-y-1">
					<p className="text-sm text-brand-grey">{tAdmin.addScreenshotsOptional}</p>

					<div className="flex flex-wrap gap-2">
						{images.map((image, idx) => (
							<div key={image.keyFile} className="relative h-14 w-14">
								<Image src={image.url} alt="screenshot" fill className="rounded-lg object-cover" />
								<Button
									type="button"
									onClick={() => handleDeleteImage(idx)}
									className="absolute right-1 top-1 h-4 w-4 rounded-full bg-black/60 p-0"
								>
									<X className="h-3 w-3 text-white" />
								</Button>
							</div>
						))}
						<Button
							type="button"
							variant="ghost"
							onClick={() => fileInputRef.current?.click()}
							className="h-14 w-14 border border-dashed"
						>
							<Plus className="h-5 w-5 text-gray-400" />
						</Button>
					</div>

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						multiple
						className="hidden"
						onChange={handleImageAdd}
					/>
					<p className="text-xs text-red-600">{tAdmin.noSensitiveInfo}</p>
				</div>
			</div>

			<div className="sticky bottom-0 bg-white pt-4">
				<div className="flex justify-between gap-2">
					<Button variant="outline" className="w-full" onClick={onClose}>
						{tAdmin.cancel}
					</Button>
					<Button
						variant="filled"
						className="w-full"
						onClick={handleSubmit(onSubmit)}
						loading={isPending}
						disabled={isPending}
					>
						{isEditMode ? tAdmin.save : tAdmin.submit}
					</Button>
				</div>
			</div>
		</div>
	);
}
