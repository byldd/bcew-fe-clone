"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputField } from "@/components/ui/inputField";
import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { IPageWithPermissions } from "../types/page";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { useRoles } from "@/module/employee/hooks/useRolesAndPermissions";
import { cn } from "@/lib/utils/utils";
import { useCreatePage, useUpdatePage } from "../hooks/pages";
import { IPageFormSchema, applicationBaseUrl, pageFormSchema } from "../utils/page-form-schema";
import { E_APPLICATION, PAGE_POSITION } from "@/module/admin/types/sideb-bar-page";
import { Switch } from "@/components/ui/switch";
import { useHandleFileUpload } from "@/hooks/useFile";
import { ICON_ALLOWED_FILE_TYPES } from "../utils/page-form-schema";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";

type PageFormProps = {
	onClose: () => void;
	parentPageId?: string;
	editPage?: IPageWithPermissions;
};

const ACCESS_OPTIONS = [
	{ label: "None", value: null },
	{ label: "Read", value: ACCESS_LEVEL.READ },
	{ label: "Write", value: ACCESS_LEVEL.WRITE },
] as const;

const POSITION_OPTIONS = [
	{ label: "None", value: null },
	{ label: "Top", value: PAGE_POSITION.TOP },
	{ label: "Bottom", value: PAGE_POSITION.BOTTOM },
] as const;

const APPLICATION_OPTIONS = [
	{ label: "BYLDD", value: E_APPLICATION.BYLDD },
	{ label: "AKME", value: E_APPLICATION.AKME },
	{ label: "Legacy", value: E_APPLICATION.LEGACY },
] as const;

const PageForm = ({ onClose, parentPageId, editPage }: PageFormProps) => {
	const { mutate: createPage, isPending: isCreating } = useCreatePage();
	const { mutate: updatePage, isPending: isUpdating } = useUpdatePage();
	const { data: roles, isLoading: isLoadingRoles } = useRoles();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();
	const isPending = isCreating || isUpdating;
	const [isUploading, setIsUploading] = useState(false);
	const iconFileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<IPageFormSchema>({
		resolver: zodResolver(pageFormSchema),
		defaultValues: {
			name: "",
			parentPageId: parentPageId ?? "",
			urlEndpoint: "",
			rolePagePermissions: [],
			positionFixed: null,
			sortOrder: undefined,
			iconUrl: "",
			iconFile: undefined,
			application: E_APPLICATION.BYLDD,
			showInSidebar: true,
		},
	});

	const { fields } = useFieldArray({ control: form.control, name: "rolePagePermissions" });

	const positionFixed = form.watch("positionFixed");
	const application = form.watch("application");
	const iconFile = form.watch("iconFile");

	useEffect(() => {
		if (!roles?.length) return;

		const permissions = roles.map((role) => {
			const existing = editPage?.rolePagePermissions?.find((p) => p.roleId === role.id);
			return {
				roleId: role.id,
				accessLevel: existing?.accessLevel ?? null,
			};
		});

		form.reset({
			name: editPage?.name ?? "",
			parentPageId: editPage?.parentPageId ?? parentPageId ?? "",
			urlEndpoint: editPage?.urlEndpoint ?? "",
			rolePagePermissions: permissions,
			positionFixed: editPage?.positionFixed ?? null,
			sortOrder: editPage?.sortOrder,
			application: editPage?.application,
			showInSidebar: editPage?.showInSidebar,
			...(editPage?.iconUrl && editPage?.iconKeyFile
				? {
						iconFile: {
							url: editPage?.iconUrl,
							keyFile: editPage?.iconKeyFile,
						},
					}
				: {}),
		});
	}, [roles, editPage, parentPageId, form]);

	const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		form.setValue("iconFile", {
			keyFile: `page-icon/${file.name}-${Date.now()}`,
			file,
			url: URL.createObjectURL(file),
		});
		e.target.value = "";
	};

	const onSubmit = async (values: IPageFormSchema) => {
		let iconImageKey = values.iconFile?.keyFile || undefined;

		if (values.iconFile?.file) {
			const filesToUpload = getFilesToUpload(values.iconFile ? [values.iconFile] : []);
			if (filesToUpload.length > 0) {
				try {
					setIsUploading(true);
					const signedUrls = await getSignedUrls(filesToUpload);
					await handleFileUpload({ signedUrls, filesToUpload });
					iconImageKey = values.iconFile!.keyFile;
				} catch {
					openErrorToast({ message: "Failed to upload icon image" });
					return;
				} finally {
					setIsUploading(false);
				}
			} else if (values.iconFile?.keyFile) {
				iconImageKey = values.iconFile.keyFile;
			} else {
				iconImageKey = undefined;
			}
		}

		const payload = {
			name: values.name,
			parentPageId: values.parentPageId || undefined,
			urlEndpoint: values.urlEndpoint || undefined,
			rolePagePermissions: values.rolePagePermissions,
			positionFixed: values.positionFixed ?? undefined,
			sortOrder: values.sortOrder,
			application: values.application,
			showInSidebar: values.showInSidebar,
			iconImageKey,
		};

		if (editPage) {
			updatePage(
				{ id: editPage.id, payload },
				{
					onSuccess: () => {
						openSuccessToast("Page updated successfully");
						onClose();
					},
					onError: (error) => openErrorToast({ error }),
				}
			);
		} else {
			createPage(payload, {
				onSuccess: () => {
					openSuccessToast("Page created successfully");
					onClose();
				},
				onError: (error) => openErrorToast({ error }),
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-2">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm text-brand-grey">Name</FormLabel>
							<FormControl>
								<InputField placeholder="Enter page name" value={field.value} onChange={field.onChange} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="application"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm text-brand-grey">Application (optional)</FormLabel>
							<FormControl>
								<div className="flex w-fit items-center rounded-lg border border-[#1515151A] p-0.5">
									{APPLICATION_OPTIONS.map((option) => {
										const isActive = field.value === option.value;
										return (
											<button
												key={option.value}
												type="button"
												onClick={() => field.onChange(isActive ? undefined : option.value)}
												className={cn(
													"rounded-md px-3 py-1 text-xs font-medium transition-colors",
													isActive
														? "bg-brand-dark text-white"
														: "text-[#15151580] hover:bg-[#1515150D] hover:text-brand-dark"
												)}
											>
												{option.label}
											</button>
										);
									})}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="urlEndpoint"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm text-brand-grey">Endpoint (optional)</FormLabel>
							<FormControl>
								{application ? (
									<div className="flex items-center overflow-hidden rounded-lg border border-[#1515151A]">
										<span className="shrink-0 border-r border-[#1515151A] bg-[#1515150A] px-3 py-2 text-xs text-[#15151580]">
											{applicationBaseUrl[application]}
										</span>
										<input
											placeholder="/path/to/page"
											value={field.value ?? ""}
											onChange={field.onChange}
											className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#15151540]"
										/>
									</div>
								) : (
									<InputField placeholder="e.g. /admin/dashboard" value={field.value ?? ""} onChange={field.onChange} />
								)}
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormItem>
					{
						<FormField
							control={form.control}
							name="iconFile"
							render={() => (
								<>
									<FormControl>
										<div className="flex items-center gap-3">
											{iconFile?.url ? (
												<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#1515151A]">
													<Image unoptimized src={iconFile.url} alt="icon preview" fill className="object-cover" />
													<button
														type="button"
														onClick={() => form.setValue("iconFile", undefined)}
														className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 hover:bg-black/80"
													>
														<X className="h-3 w-3 text-white" />
													</button>
												</div>
											) : (
												<button
													type="button"
													onClick={() => iconFileInputRef.current?.click()}
													className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#1515151A] bg-[#1515150A] transition-colors hover:border-brand-dark hover:bg-[#1515150D]"
												>
													<ImageIcon className="h-5 w-5 text-[#15151580]" />
													<span className="text-[10px] text-[#15151580]">Upload</span>
												</button>
											)}
											{iconFile?.url && (
												<button
													type="button"
													onClick={() => iconFileInputRef.current?.click()}
													className="text-xs text-brand-dark underline underline-offset-2"
												>
													Replace image
												</button>
											)}
											<input
												ref={iconFileInputRef}
												type="file"
												accept={ICON_ALLOWED_FILE_TYPES.join(",")}
												className="hidden"
												onChange={handleIconFileChange}
											/>
										</div>
									</FormControl>
									<FormMessage />
								</>
							)}
						/>
					}
				</FormItem>

				<FormField
					control={form.control}
					name="positionFixed"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-sm text-brand-grey">Fixed Position</FormLabel>
							<FormControl>
								<div className="flex w-fit items-center rounded-lg border border-[#1515151A] p-0.5">
									{POSITION_OPTIONS.map((option) => {
										const isActive = field.value === option.value;
										return (
											<button
												key={String(option.value)}
												type="button"
												onClick={() => field.onChange(option.value)}
												className={cn(
													"rounded-md px-3 py-1 text-xs font-medium transition-colors",
													isActive
														? "bg-brand-dark text-white"
														: "text-[#15151580] hover:bg-[#1515150D] hover:text-brand-dark"
												)}
											>
												{option.label}
											</button>
										);
									})}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{positionFixed && (
					<FormField
						control={form.control}
						name="sortOrder"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-sm text-brand-grey">Sort Order</FormLabel>
								<FormControl>
									<InputField
										type="number"
										placeholder="Enter sort order"
										value={field.value != null ? String(field.value) : ""}
										onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}

				<FormField
					control={form.control}
					name="showInSidebar"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between">
								<FormLabel className="text-sm text-brand-grey">Show in Sidebar</FormLabel>
								<FormControl>
									<Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
								</FormControl>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex flex-col gap-2">
					<p className="text-sm text-brand-grey">Role Permissions</p>

					{isLoadingRoles && (
						<div className="flex flex-col gap-2">
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="h-9 animate-pulse rounded-lg bg-[#1515150D]" />
							))}
						</div>
					)}

					{!isLoadingRoles && fields.length > 0 && (
						<div className="flex flex-col gap-1.5 rounded-xl border border-[#1515151A] p-1">
							{fields.map((field, index) => {
								const role = roles?.find((r) => r.id === field.roleId);
								const current = form.watch(`rolePagePermissions.${index}.accessLevel`);

								return (
									<div
										key={field.id}
										className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-[#1515150A]"
									>
										<span className="text-sm font-medium text-brand-dark">{role?.name ?? field.roleId}</span>

										<div className="flex items-center rounded-lg border border-[#1515151A] p-0.5">
											{ACCESS_OPTIONS.map((option) => {
												const isActive = current === option.value;
												return (
													<button
														key={String(option.value)}
														type="button"
														onClick={() =>
															form.setValue(`rolePagePermissions.${index}.accessLevel`, option.value, {
																shouldDirty: true,
															})
														}
														className={cn(
															"rounded-md px-3 py-1 text-xs font-medium transition-colors",
															isActive
																? "bg-brand-dark text-white"
																: "text-[#15151580] hover:bg-[#1515150D] hover:text-brand-dark"
														)}
													>
														{option.label}
													</button>
												);
											})}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<div className="flex gap-3 pt-1">
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						onClick={onClose}
						disabled={isPending || isUploading}
					>
						Cancel
					</Button>
					<Button type="submit" variant="filled" className="flex-1" loading={isPending || isUploading}>
						{editPage ? "Update" : "Create"}
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default PageForm;
