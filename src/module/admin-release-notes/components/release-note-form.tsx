"use client";

import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Paperclip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateReleaseNote, useUpdateReleaseNote } from "../hooks/useReleaseNotes";
import { useHandleFileUpload } from "@/hooks/useFile";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { toMidnightDateString, toDate, toFormattedDate } from "@/lib/utils/date";
import { AUDIENCE, IReleaseNote } from "../types/release-note";
import { releaseNoteSchema, IReleaseNoteSchema, getFileName } from "../utils/release-note";
import { v4 as uuidv4 } from "uuid";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { SelectField } from "@/components/ui/selectField";
import { usePermissions } from "../hooks/usePermission";
import { TAB_TYPE } from "../types/release-note";
import { useReleaseNoteTabParam } from "../hooks/useReleaseNoteTabParam";
import QuillEditor from "@/components/common/quill-editor";
import { normalizeReleaseNoteContent } from "../utils/release-note";

interface ReleaseNoteFormProps {
	onClose: () => void;
	releaseNote?: IReleaseNote | null;
}

const ReleaseNoteForm = ({ onClose, releaseNote }: ReleaseNoteFormProps) => {
	const isEditMode = !!releaseNote;
	const fileInputRef = useRef<HTMLInputElement>(null);

	const queryClient = useQueryClient();
	const { mutate: createReleaseNote, isPending: isCreating } = useCreateReleaseNote();
	const { mutate: updateReleaseNote, isPending: isUpdating } = useUpdateReleaseNote();
	const { getSignedUrls, handleFileUpload, getFilesToUpload } = useHandleFileUpload();
	const tAdmin = useTypedTranslations(NAMESPACE.RELEASE_NOTE);
	const { isEmployeeWrite, isAdminWrite } = usePermissions();
	const { clearDateParam } = useReleaseNoteTabParam({
		defaultTab: TAB_TYPE.ALL,
		allowedTabs: [TAB_TYPE.ALL, TAB_TYPE.ADMIN, TAB_TYPE.TECHNICIAN],
	});

	const isPending = isCreating || isUpdating;

	const form = useForm<IReleaseNoteSchema>({
		resolver: zodResolver(releaseNoteSchema),
		defaultValues: {
			date: releaseNote?.date || "",
			audience: releaseNote?.audience
				? releaseNote.audience
				: isEmployeeWrite && !isAdminWrite
					? AUDIENCE.TECHNICIAN
					: undefined,
			content: releaseNote?.content || "",
			files: [],
		},
		mode: "onChange",
	});

	// Reset form when releaseNote changes (switching between create/edit)
	useEffect(() => {
		if (releaseNote) {
			form.reset({
				content: releaseNote.content,
				date: releaseNote.date,
				audience: releaseNote.audience,
				files:
					releaseNote.attachments?.map((a) => ({
						keyFile: a.keyFile,
						url: a.url,
					})) || [],
			});
		} else {
			form.reset({
				content: "",
				date: "",
				audience: undefined,
				files: [],
			});
		}
	}, [releaseNote, form]);

	const { files } = form.watch();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;
		const newFiles = Array.from(e.target.files).map((file) => ({
			keyFile: `release-note/${uuidv4()}-${file.name}`,
			file,
			url: "",
		}));
		form.setValue("files", [...(files || []), ...newFiles]);
		e.target.value = "";
	};

	const handleRemoveFile = (keyFile: string) => {
		form.setValue(
			"files",
			(files || []).filter((f) => f.keyFile !== keyFile)
		);
	};

	const onSubmit = async (data: IReleaseNoteSchema) => {
		const filesToUpload = getFilesToUpload(data.files || []);

		let uploadedFiles: { keyFile: string }[] = [];

		if (filesToUpload.length > 0) {
			const signedUrls = await getSignedUrls(filesToUpload);

			await handleFileUpload({ signedUrls, filesToUpload });

			uploadedFiles = signedUrls.map((s) => ({
				keyFile: s.keyFile,
			}));
		}

		const existingFiles = (data.files || [])
			.filter((f) => !f.file && f.keyFile)
			.map((f) => ({
				keyFile: f.keyFile as string,
			}));

		const payload = {
			content: data.content,
			date: data.date,
			audience: data.audience,
			attachments: [...existingFiles, ...uploadedFiles],
		};

		if (isEditMode && releaseNote) {
			updateReleaseNote(
				{ id: releaseNote.id, data: payload },
				{
					onSuccess: () => {
						openSuccessToast(`Production notes for ${toFormattedDate(data.date)} successfully updated.`);
						queryClient.invalidateQueries({ queryKey: ["release-notes-infinite"] });
						onClose();
						clearDateParam();
					},
					onError: (error) => {
						openErrorToast({ error });
					},
				}
			);
		} else {
			createReleaseNote(payload, {
				onSuccess: () => {
					openSuccessToast(`Production notes for ${toFormattedDate(payload.date)} successfully published.`);
					queryClient.invalidateQueries({ queryKey: ["release-notes-infinite"] });
					onClose();
					clearDateParam();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			});
		}
	};

	return (
		<div className="flex h-full flex-col pt-2">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col space-y-4">
					{/* Date */}
					<FormField
						control={form.control}
						name="date"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel className="font-inter text-sm font-medium text-brand-dark50">{tAdmin.selectDate}</FormLabel>
								<FormControl>
									<DatePicker
										value={field.value ? toDate(field.value) : undefined}
										onChange={(d) => field.onChange(toMidnightDateString(d))}
										placeholder="MM/DD/YYYY"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Target Audience */}
					<FormField
						control={form.control}
						name="audience"
						render={({ field }) => {
							const filteredOptions =
								isEmployeeWrite && !isAdminWrite
									? [AUDIENCE.TECHNICIAN]
									: [AUDIENCE.ALL, AUDIENCE.ADMIN, AUDIENCE.TECHNICIAN];

							return (
								<FormItem className="space-y-1">
									<FormLabel className="font-inter text-sm font-medium text-brand-dark50">
										{tAdmin.targetAudience}
									</FormLabel>

									<FormControl>
										<SelectField
											options={filteredOptions.map((opt) => ({
												label: opt,
												value: opt,
											}))}
											value={field.value}
											onValueChange={(value) => field.onChange(value)}
											placeholder="Select Audience"
											disabled={isEmployeeWrite && !isAdminWrite}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							);
						}}
					/>

					{/* Note Content */}
					<FormField
						control={form.control}
						name="content"
						render={({ field }) => (
							<FormItem className="space-y-1">
								<FormLabel className="font-inter text-sm font-medium text-brand-dark50">{tAdmin.addNote}</FormLabel>

								<FormControl>
									<QuillEditor
										value={field.value}
										onChange={(value) => field.onChange(normalizeReleaseNoteContent(value))}
										placeholder={tAdmin.enterNotesHere}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* File Upload */}

					{files?.map((f) => (
						<div
							key={f.keyFile}
							className="flex items-center justify-between gap-1.5 rounded-[8px] border bg-white px-3 py-3 text-xs font-medium text-brand-dark"
						>
							<span className="max-w-[140px] truncate">{f.file?.name || getFileName(f.keyFile)}</span>

							<button type="button" onClick={() => handleRemoveFile(f.keyFile || "")} className="text-brand-red">
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					))}
					<div className="space-y-2">
						<input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
						<Button type="button" variant={"filled"} onClick={() => fileInputRef.current?.click()}>
							<Paperclip className="h-4 w-4" />
							{tAdmin.attachFiles}
						</Button>
					</div>
					{/* Footer Buttons */}

					<div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 bg-white pt-4">
						<Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="w-full">
							{tAdmin.cancel}
						</Button>
						<Button type="submit" variant={"filled"} disabled={isPending} loading={isPending} className="w-full">
							{isEditMode ? tAdmin["save&update"] : tAdmin["save&publish"]}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default ReleaseNoteForm;
