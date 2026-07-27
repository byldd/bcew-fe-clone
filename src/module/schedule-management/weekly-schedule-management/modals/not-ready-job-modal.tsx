"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TextareaField } from "@/components/ui/textareaField";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { IMarkNotReadyFormSchema, markNotReadyFormSchema } from "../utils/mark-not-ready-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import RadioGroupField from "@/components/ui/radio-group-field";
import ImageUpload from "@/components/shared/image-upload/image-upload";
import { useHandleFileUpload } from "@/hooks/useFile";
import { useGetDailyJob, useMarkJobAsNotReady } from "../hooks/useSchedule";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { OptionYesNo } from "@/utils/enums";
import { useQueryClient } from "@tanstack/react-query";
import { IWeekScheduleResponse } from "../types/schedule-interface";
import { Spinner } from "@/components/ui/spinner";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useHandleJobOperation } from "../hooks/useHandleJobOperation";

interface MarkJobAsNotReadyModalProps {
	onClose: () => void;
	dailyJob?: IWeekScheduleResponse["dailyJobs"][number];
	dailyJobId?: string;
}

const MarkJobAsNotReadyModal: React.FC<MarkJobAsNotReadyModalProps> = ({ onClose, dailyJob, dailyJobId }) => {
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const { mutate: markJobAsNotReady, isPending } = useMarkJobAsNotReady();
	const { data, isFetching } = useGetDailyJob(dailyJobId!, !!dailyJobId);
	const clickedFromNotification = !!dailyJobId;
	const { user } = useAuthStore((state) => state);
	dailyJob = data?.dailyJob || dailyJob;
	const { onUpdateDailyJob } = useHandleJobOperation();

	const queryClient = useQueryClient();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const form = useForm<IMarkNotReadyFormSchema>({
		resolver: zodResolver(markNotReadyFormSchema),
		mode: "onChange",
		defaultValues: {
			isReady: clickedFromNotification ? dailyJob?.notReadyUpdate?.isReady : false,
			isClean: clickedFromNotification ? dailyJob?.notReadyUpdate?.isClean : false,
			updateForCrew: dailyJob?.notReadyUpdate?.updateForCrew || "",
			sendSms: dailyJob?.notReadyUpdate?.sendSms || false,
			images: dailyJob?.images?.map((image) => ({
				keyFile: image.keyFile,
				url: image.url,
			})),
			note: dailyJob?.notReadyUpdate?.note || "",
		},
	});

	const onSubmit = async (data: IMarkNotReadyFormSchema, markReady: boolean) => {
		if (!dailyJob?.id) return;
		const filesToUpload = getFilesToUpload(data?.images || []);
		const signedUrls = await getSignedUrls(filesToUpload);
		markJobAsNotReady(
			{
				dailyJobId: dailyJob?.id,
				isClean: markReady,
				updateForCrew: data.updateForCrew,
				sendSms: data.sendSms,
				isReady: markReady,
				imagesKeyFiles: data?.images?.map((image) => image.keyFile),
			},
			{
				onSuccess: async (responseData) => {
					openSuccessToast(data.isReady ? tschedule.jobMarkedAsReady : tschedule.jobMarkedAsNotReady);
					await handleFileUpload({ signedUrls, filesToUpload });
					if (!clickedFromNotification) {
						onUpdateDailyJob({
							updatedJob: responseData,
							dailyJobId: dailyJob.id,
						});
						void queryClient.invalidateQueries({ queryKey: ["weekly-schedule"] });
					}
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	useEffect(() => {
		form.reset({
			isReady: clickedFromNotification ? dailyJob?.notReadyUpdate?.isReady : false,
			isClean: clickedFromNotification ? dailyJob?.notReadyUpdate?.isClean : false,
			updateForCrew: dailyJob?.notReadyUpdate?.updateForCrew || "",
			sendSms: dailyJob?.notReadyUpdate?.sendSms || false,
			images: dailyJob?.images?.map((image) => ({
				keyFile: image.keyFile,
				url: image.url,
			})),
			note: dailyJob?.notReadyUpdate?.note || "",
		});
	}, [dailyJob, form, clickedFromNotification]);

	if (isFetching) return <Spinner />;

	return (
		<Form {...form}>
			<form>
				<div className="space-y-4 p-1">
					<div className="flex gap-4">
						<FormField
							control={form.control}
							name="isReady"
							render={({ field }) => (
								<FormItem className="w-full flex-1">
									<Label className="text-sm font-medium text-brand-dark60">{tschedule.isTheSiteReady}</Label>
									<FormControl>
										<RadioGroupField
											options={Object.values(OptionYesNo).map((option) => ({
												label: option,
												value: option,
											}))}
											value={field.value ? OptionYesNo.YES : OptionYesNo.NO}
											onChange={(value) => field.onChange(value === OptionYesNo.YES)}
											disabled={true}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="isClean"
							render={({ field }) => (
								<FormItem className="w-full flex-1">
									<Label className="text-sm font-medium text-brand-dark60">{tschedule.isTheHomeClean}</Label>
									<FormControl>
										<RadioGroupField
											options={Object.values(OptionYesNo).map((option) => ({
												label: option,
												value: option,
											}))}
											value={field.value ? OptionYesNo.YES : OptionYesNo.NO}
											onChange={(value) => field.onChange(value === OptionYesNo.YES)}
											disabled={true}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name={clickedFromNotification ? "note" : "updateForCrew"}
						render={({ field }) => (
							<FormItem className="w-full flex-1">
								<FormControl>
									<TextareaField
										label={clickedFromNotification ? tschedule.notesFromCrewMembers : tschedule.updateForTheCrewMembers}
										placeholder={tschedule.updateTheCrewWithAnyRelevantInformationHere}
										value={field.value}
										onChange={(e) => field.onChange(e.target.value)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="images"
						render={({ field }) => (
							<FormItem className="w-full flex-1">
								<FormControl>
									<ImageUpload
										value={field.value || []}
										onChange={field.onChange}
										label={
											clickedFromNotification
												? tschedule.imagesUpdatedByCrewMember
												: tschedule.uploadAnySupportingImages
										}
										disabled={clickedFromNotification}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{user?.role?.canSendNotification && (
						<FormField
							control={form.control}
							name="sendSms"
							render={({ field }) => (
								<FormItem className="flex w-full flex-1 items-center gap-2">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={(val) => field.onChange(val === true)}
											className="h-4 w-4 rounded border-gray-300 accent-brand-dark"
											id="remember-me"
										/>
									</FormControl>
									<Label className="text-sm font-medium text-brand-dark60">{tCommon.sendSmsNotification}</Label>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<div className="flex justify-end gap-4">
						{clickedFromNotification ? (
							<Button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onSubmit(form.getValues(), true);
								}}
								key={"mark-as-ready"}
								type="submit"
								variant={"outline"}
								className="h-10 w-full"
							>
								{tschedule.markAsReady}
							</Button>
						) : (
							<Button
								key={"cancel-not-ready"}
								type="button"
								variant={"outline"}
								onClick={onClose}
								className="h-10 w-full"
							>
								{tCommon.cancel}
							</Button>
						)}
						<Button
							key={"mark-as-not-ready"}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onSubmit(form.getValues(), false);
							}}
							disabled={isPending}
							variant={"filled"}
							className="h-10 w-full"
						>
							{tschedule.markAsNotReady}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};

export default MarkJobAsNotReadyModal;
