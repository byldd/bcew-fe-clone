"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import RadioGroupField from "@/components/ui/radio-group-field";
import ImageUpload from "@/components/shared/image-upload/image-upload";
import { useHandleFileUpload } from "@/hooks/useFile";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { OptionYesNo } from "@/utils/enums";
import { useQueryClient } from "@tanstack/react-query";

import {
	INotReadyUpdate,
	IUploadImage,
} from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { legends } from "../../constants/legend-items";
import { useUpdateMarkJobAsNotReady } from "@/module/job/hooks/useEmployeeSchedule";
import { ISubContractorDailyJobSchedule } from "@/module/sub-contractor/types";
import { useSubContractorUpdateMarkJobAsNotReady } from "@/module/sub-contractor/hooks/useSubContractorJobSchedule";
import useAuthStore from "@/store/auth-store";
import { IMarkNotReadyFormSchema, markNotReadyFormSchema } from "../../utils/mark-not-ready-form";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { isBoolean } from "@/module/job/utils";
import DidNotWorkButton from "./did-not-work-button";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";

interface IJobNewStartModalProps {
	didNotWork?: boolean;
	assignmentId?: string | undefined;
	onClose: (id?: string) => void;
	onSubmitSuccess?: () => void | Promise<void>;
	dailyJob:
		| {
				id: string;
				notReadyUpdate: INotReadyUpdate | undefined;
				images: IUploadImage[] | undefined;
				jobLabelAssignments:
					| {
							id: string;
							labelId: string;
							jobDailyRecordId: string;
					  }[]
					| undefined;
				recnum?: number | undefined;
		  }
		| ISubContractorDailyJobSchedule;
}
const JobNewStartModal: React.FC<IJobNewStartModalProps> = ({
	onClose,
	onSubmitSuccess,
	dailyJob,
	didNotWork,
	assignmentId,
}) => {
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const { mutate: markJobAsNotReady, isPending } = useUpdateMarkJobAsNotReady();
	const { mutate: markJobAsNotReadySubContractor, isPending: isPendingSubContractor } =
		useSubContractorUpdateMarkJobAsNotReady(user, subcontractorCrew);

	const queryClient = useQueryClient();
	const { id, notReadyUpdate, images, jobLabelAssignments } = dailyJob;
	const isWarrantyJob =
		jobLabelAssignments && jobLabelAssignments.some((label) => label.labelId === legends.warrantyJob);

	const form = useForm<IMarkNotReadyFormSchema>({
		resolver: zodResolver(markNotReadyFormSchema),
		mode: "onChange",
		defaultValues: {
			isReady: notReadyUpdate?.isReady ?? undefined,
			isClean: notReadyUpdate?.isClean ?? undefined,
			note: notReadyUpdate?.note || "",
			images: images?.map((image) => ({
				keyFile: image.keyFile || "",
				url: image.url,
			})),
		},
	});

	const { isReady, isClean } = form.watch();
	const shouldShowDidNotWorkButton = assignmentId && !isBoolean(isClean) && !isBoolean(isReady) && !didNotWork;

	useEffect(() => {
		form.clearErrors();
	}, [isReady, isClean, form]);

	const onSubmit = async (data: IMarkNotReadyFormSchema) => {
		const filesToUpload = getFilesToUpload(data?.images || []);
		const signedUrls = await getSignedUrls(filesToUpload);

		const { isClean, isReady, note, images } = data;
		const isJobReady = isReady || (isWarrantyJob && isClean);

		const payload = {
			dailyJobId: id,
			isClean: isClean,
			isReady: isWarrantyJob && isClean ? true : isReady,
			note: note,
			imagesKeyFiles: isJobReady ? [] : images?.map((image) => image.keyFile) || [],
		};

		if (user?.subContractor || subcontractorCrew) {
			markJobAsNotReadySubContractor(payload, {
				onSuccess: async () => {
					await handleFileUpload({ signedUrls, filesToUpload });
					await queryClient.invalidateQueries({ queryKey: ["subContractorSchedules"] });
					openSuccessToast(`${isJobReady && isClean ? "Job marked as ready" : "Job marked as not ready"}`);
					onClose(assignmentId);
					await onSubmitSuccess?.();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			});
		} else {
			markJobAsNotReady(payload, {
				onSuccess: async () => {
					await handleFileUpload({ signedUrls, filesToUpload });
					await queryClient.invalidateQueries({ queryKey: ["weekly-schedule"] });
					openSuccessToast(`${isJobReady && isClean ? "Job marked as ready" : "Job marked as not ready"}`);
					onClose(assignmentId);
					await onSubmitSuccess?.();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="space-y-4 pt-4">
					<div className="space-y-4">
						{!isWarrantyJob && (
							<FormField
								control={form.control}
								name="isReady"
								render={({ field }) => (
									<FormItem className="w-full flex-1">
										<Label className="text-sm font-medium text-brand-dark60">{tEmployee.isHomeReadyToStart}</Label>
										<FormControl>
											<RadioGroupField
												options={Object.values(OptionYesNo).map((option) => ({
													label: option,
													value: option,
												}))}
												value={field.value === undefined ? undefined : field.value ? OptionYesNo.YES : OptionYesNo.NO}
												onChange={(value) => field.onChange(value === OptionYesNo.YES)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							control={form.control}
							name="isClean"
							render={({ field }) => (
								<FormItem className="w-full flex-1 items-center">
									<Label className="text-sm font-medium text-brand-dark60">{tEmployee.isHomeClean}</Label>
									<FormControl>
										<div className="flex items-center gap-4">
											<RadioGroupField
												options={Object.values(OptionYesNo).map((option) => ({
													label: option,
													value: option,
												}))}
												value={field.value === undefined ? undefined : field.value ? OptionYesNo.YES : OptionYesNo.NO}
												onChange={(value) => field.onChange(value === OptionYesNo.YES)}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="note"
						render={({ field }) => (
							<FormItem className="w-full flex-1">
								<FormLabelRequired label={tEmployee.addNote} required={!isReady || !isClean} />
								<FormControl className="px-2">
									<TextareaField
										placeholder={tEmployee.typeHere}
										value={field.value}
										onChange={(e) => field.onChange(e.target.value)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{((!isWarrantyJob && (!isReady || !isClean)) || (isWarrantyJob && !isClean)) && (
						<>
							<FormField
								control={form.control}
								name="images"
								render={({ field }) => (
									<FormItem className="w-full flex-1">
										<FormLabelRequired label={tEmployee.addImages} required={!isReady || !isClean} />
										<FormControl>
											<ImageUpload value={field.value || []} onChange={field.onChange} label={""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}

					<div className="flex justify-end gap-4">
						<Button onClick={() => onClose(assignmentId)} variant={"outline"} className="h-10 w-full">
							{tEmployee.skip}
						</Button>
						<Button
							type="submit"
							disabled={isPending || isPendingSubContractor}
							variant={"filled"}
							className="h-10 w-full"
						>
							{tEmployee.update}
						</Button>
					</div>
					{shouldShowDidNotWorkButton && (
						<Button className="flex w-full justify-center">
							<DidNotWorkButton assignmentId={assignmentId} onClose={() => onClose(assignmentId)} />
						</Button>
					)}
				</div>
			</form>
		</Form>
	);
};

export default JobNewStartModal;
