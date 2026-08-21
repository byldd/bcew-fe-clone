"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useModal } from "@/hooks/useModal";
import { MissingItemModalContent } from "@/module/job/material-selection/components/missing-item-modal-content";
import MaterialSelectionHeader from "../components/material-selection-header";
import MaterialSelectionSearch from "../components/material-selection-search";
import MaterialSelectionList from "../components/material-selection-list";
import MaterialSelectionFooter from "../components/material-selection-footer";
import PreviewRequestView from "../components/material-selection-preview-request";
import RequestSuccessView from "../components/material-selection-request-success";
import {
	useCreateMaterialSelectionRequest,
	useEmployeePullList,
	useMaterialSelectionEmployees,
} from "../hooks/useEmployeePullList";
import {
	canSelectAddendumReason,
	filterMaterialsWithTakeoff,
	getIMaterialSelectionItemPayload,
	isItemReadyForConfirm,
	mapPullListItemsToMaterials,
	mapTakeoffItemsToMaterials,
	isAddendumReason,
	isDamagedReason,
	isNoteOnlyReason,
	isPhotoNoteReason,
	isPullListIssueReason,
	isWarrantyReason,
} from "../utils";
import type { MaterialSelectionItem } from "../utils/types";
import { materialSelectionFormSchema, type IMaterialSelectionFormSchema } from "../utils/material-selection-form";
import type { MaterialSelectionSubmitPayload } from "../utils/types";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useHandleFileUpload } from "@/hooks/useFile";
import { MATERIAL_SELECTION_VIEW } from "../utils/enums";
import { SelectField } from "@/components/ui/selectField";
import useAuthStore from "@/store/auth-store";
import { E_ROLES } from "@/utils/enums";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MaterialSelectionTemplate({ jobnum, tsknum }: { jobnum?: number; tsknum?: number }) {
	const { id: assignmentId } = useParams<{ id?: string }>();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [currentView, setCurrentView] = useState<
		MATERIAL_SELECTION_VIEW.SELECTION | MATERIAL_SELECTION_VIEW.PREVIEW | MATERIAL_SELECTION_VIEW.SUCCESS
	>(MATERIAL_SELECTION_VIEW.SELECTION);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [requestResult, setRequestResult] = useState<{
		requestId: number;
		itemsRequested: number;
		processing: string;
	} | null>(null);
	const { openModal, closeModal, Modal } = useModal();
	const { user: authUser } = useAuthStore();
	const user = authUser;
	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();
	const canSelectAddendum = canSelectAddendumReason({
		isForeman,
		materialRole: user?.materialRole,
		userType: user?.userType,
	});

	const { control, getValues, handleSubmit, resetField, setValue, formState } = useForm<IMaterialSelectionFormSchema>({
		defaultValues: {
			assignmentId,
			jobnum,
			tsknum,
			userId: undefined,
			items: [],
		},
		resolver: zodResolver(materialSelectionFormSchema),
		mode: "onChange",
	});

	const { append, replace } = useFieldArray({ control, name: "items", keyName: "fieldId" });
	const { mutateAsync: createMaterialSelectionRequest } = useCreateMaterialSelectionRequest();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const {
		data: pullListData,
		isLoading: isPullListLoading,
		isError: isPullListError,
	} = useEmployeePullList({ assignmentId });
	const { data: employeeOptions, isLoading: isEmployeesLoading } = useMaterialSelectionEmployees({
		enabled: isForeman,
	});
	const employeeSelectOptions = useMemo(
		() =>
			(employeeOptions ?? []).map((employee) => ({
				label: employee.user?.name ?? "Unknown",
				value: employee.user?.id ?? employee.id,
			})),
		[employeeOptions]
	);
	const addendumReferenceOptions = pullListData?.addendumReferenceOptions ?? [];
	const workOrderOptions = pullListData?.workOrderOptions ?? [];
	const reasonAvailability = pullListData?.reasonAvailability;

	const items = useMemo(() => mapPullListItemsToMaterials(pullListData?.items ?? []), [pullListData?.items]);

	const takeoffItems = useMemo(
		() => mapTakeoffItemsToMaterials(pullListData?.takeoffItems ?? [], pullListData?.items ?? []),
		[pullListData?.takeoffItems, pullListData?.items]
	);

	const watchedItems = useWatch({ control, name: "items" });
	const formItems = useMemo(() => watchedItems ?? [], [watchedItems]);
	const selectedEmployeeId = useWatch({ control, name: "userId" });

	const filteredItems = useMemo(
		() => filterMaterialsWithTakeoff({ items, takeoffItems, selectedItems: formItems, query }),
		[items, takeoffItems, formItems, query]
	);

	const selectedIndexById = useMemo(() => {
		const map: Record<string, number> = {};
		formItems.forEach((item, index) => {
			map[item.partId] = index;
		});
		return map;
	}, [formItems]);

	const selectedById = useMemo(() => {
		const map: Record<string, boolean> = {};
		formItems.forEach((item) => {
			map[item.partId] = true;
		});
		return map;
	}, [formItems]);

	const selectedCount = formItems.length;

	const toggleItem = (item: MaterialSelectionItem, checked: boolean) => {
		const currentItems = getValues("items") ?? [];
		const existingIndex = currentItems.findIndex((entry) => entry.partId === item.partId);

		if (checked) {
			if (existingIndex === -1) {
				append({ ...item, quantity: "", reason: "" });
			}
			return;
		}

		if (existingIndex !== -1) {
			replace(currentItems.filter((entry) => entry.partId !== item.partId));
		}
	};

	const clearAll = () => {
		replace([]);
		setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
	};

	const handleDeletePreviewItem = (partId: string) => {
		const currentItems = getValues("items") ?? [];
		const updated = currentItems.filter((entry) => entry.partId !== partId);
		replace(updated);
		if (updated.length === 0) {
			setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
		}
	};

	const clearReasonSpecificFields = (index: number, reason: string) => {
		resetField(`items.${index}.receivedInput`);
		resetField(`items.${index}.needed`);
		resetField(`items.${index}.pullListConfirmed`);
		resetField(`items.${index}.additionalQuantity`);
		resetField(`items.${index}.referenceId`);
		resetField(`items.${index}.workOrderNumber`);
		resetField(`items.${index}.images`);
		resetField(`items.${index}.note`);

		if (isPullListIssueReason(reason)) {
			setValue(`items.${index}.receivedInput`, "");
			setValue(`items.${index}.note`, "");
		}

		if (isAddendumReason(reason)) {
			setValue(`items.${index}.referenceId`, "");
			setValue(`items.${index}.note`, "");
		}

		if (isWarrantyReason(reason)) {
			setValue(`items.${index}.workOrderNumber`, "");
			setValue(`items.${index}.note`, "");
		}

		if (isDamagedReason(reason)) {
			setValue(`items.${index}.images`, []);
			setValue(`items.${index}.note`, "");
		}

		if (isPhotoNoteReason(reason)) {
			setValue(`items.${index}.images`, []);
			setValue(`items.${index}.note`, "");
		}

		if (isNoteOnlyReason(reason)) {
			setValue(`items.${index}.note`, "");
		}
	};

	const onReasonChange = (index: number, reason: string) => {
		clearReasonSpecificFields(index, reason);
	};

	const openMissingItemModal = () => {
		openModal({
			modalTitle: "Request an Unknown Item",
			subHeader: "Your request will be sent to foreman for review",
			modalView: <MissingItemModalContent assignmentId={assignmentId} onClose={closeModal} />,
			variant: "default",
			showDefaultClose: true,
		});
	};

	const openViewMissingItemRequests = () => {
		router.push(isForeman ? routes.employee.foremanMissingItemRequests : routes.employee.missingItemRequests);
	};

	const isConfirmDisabled = useMemo(() => {
		if (selectedCount === 0) return true;
		return formItems.some((item) => !isItemReadyForConfirm(item));
	}, [formItems, selectedCount]);

	const buildPayload = (data: IMaterialSelectionFormSchema): MaterialSelectionSubmitPayload => ({
		assignmentId: data.assignmentId,
		userId: data.userId || undefined,
		items: data.items.map(getIMaterialSelectionItemPayload),
	});

	const openPreview = () => {
		setCurrentView(MATERIAL_SELECTION_VIEW.PREVIEW);
	};

	const handlePreviewBack = () => {
		setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
	};

	const handleAddAnotherItem = () => {
		setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
	};

	const handleCancelRequest = () => {
		openModal({
			modalTitle: "Cancel Request",
			showDefaultClose: true,
			modalView: (
				<div className="space-y-6 pb-1">
					<p className="text-[15px] text-brand-dark">All selections will be discarded.</p>
					<Button
						type="button"
						variant="filled"
						className="h-12 w-full rounded-[12px] text-base font-medium"
						onClick={() => {
							closeModal();
							router.back();
						}}
					>
						Confirm
					</Button>
				</div>
			),
		});
	};

	const handleSubmitRequest = async (data: IMaterialSelectionFormSchema) => {
		if (isSubmitting) return;

		setIsSubmitting(true);
		try {
			const allImages = data.items.flatMap((item) => item.images ?? []);
			const filesToUpload = getFilesToUpload(allImages);

			const publicUrlByKeyFile = new Map<string, string>();
			if (filesToUpload.length > 0) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });

				for (const { keyFile, url } of signedUrls) {
					try {
						const parsed = new URL(url);
						publicUrlByKeyFile.set(keyFile, `${parsed.origin}${parsed.pathname}`);
					} catch {
						publicUrlByKeyFile.set(keyFile, url);
					}
				}
			}

			const resolvedData: IMaterialSelectionFormSchema = {
				...data,
				items: data.items.map((item) => ({
					...item,
					images: item.images?.map((img) => ({
						...img,
						url: publicUrlByKeyFile.get(img.keyFile) ?? img.url,
					})),
				})),
			};

			const payload = buildPayload(resolvedData);
			const result = await createMaterialSelectionRequest(payload);
			setCurrentView(MATERIAL_SELECTION_VIEW.SUCCESS);
			openSuccessToast("Request submitted successfully");
			setRequestResult(result);
			replace([]);
		} catch (error) {
			openErrorToast({ error: error as Error });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmitInvalid = () => {
		openErrorToast({ message: "Please complete all required fields before submitting." });
	};

	const previewItems = formItems.map((item) => getIMaterialSelectionItemPayload(item));

	const closeSuccessModal = () => {
		setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
		setRequestResult(null);
	};

	useEffect(() => {
		setValue("assignmentId", assignmentId);
		setValue("jobnum", jobnum);
		setValue("tsknum", tsknum);
	}, [assignmentId, jobnum, setValue, tsknum]);

	if (isPullListError) {
		return (
			<div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-6 text-center">
				<p className="text-base font-medium text-brand-dark">No pull list available</p>
				<p className="text-sm text-brand-dark50">Daily job record not available</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col bg-brand-bgLightgrey">
			{currentView === MATERIAL_SELECTION_VIEW.SELECTION && (
				<>
					<div className="shrink-0 space-y-4 px-4 pt-6">
						<MaterialSelectionHeader
							onAddMissingItemRequest={openMissingItemModal}
							onViewMissingItemRequests={openViewMissingItemRequests}
							isForeman={isForeman}
						/>
						<MaterialSelectionSearch value={query} onChange={setQuery} />
						{isForeman && (
							<div className="space-y-1">
								<p className="text-sm font-medium text-brand-dark50">Select an employee receiving material</p>
								<div className="relative">
									<Controller
										control={control}
										name="userId"
										render={({ field }) => (
											<SelectField
												placeholder="Select employee"
												options={employeeSelectOptions}
												value={field.value ?? ""}
												onValueChange={(value) => field.onChange(value || undefined)}
												disabled={isEmployeesLoading || employeeSelectOptions.length === 0}
												className="h-9 rounded-[8px] bg-white"
											/>
										)}
									/>
									{selectedEmployeeId && (
										<Button
											type="button"
											aria-label="Clear selected employee"
											className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-dark50 hover:text-brand-dark"
											onClick={(event) => {
												event.preventDefault();
												event.stopPropagation();
												setValue("userId", undefined, {
													shouldDirty: true,
													shouldTouch: true,
													shouldValidate: true,
												});
											}}
										>
											<X className="h-3.5 w-3.5" />
										</Button>
									)}
								</div>
								<p className="text-[10px] font-medium text-rose-500">
									Foreman: If ordering material for a employee please list the employee. If left blank the receiving
									employee will be you.
								</p>
							</div>
						)}
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
						<MaterialSelectionList
							items={filteredItems}
							selectedById={selectedById}
							selectedIndexById={selectedIndexById}
							formItems={formItems}
							control={control}
							onToggle={toggleItem}
							onReasonChange={onReasonChange}
							addendumOptions={addendumReferenceOptions}
							workOrderOptions={workOrderOptions}
							reasonAvailability={reasonAvailability}
							errors={formState.errors}
							isLoading={isPullListLoading}
							canSelectAddendum={canSelectAddendum}
						/>
					</div>
					<MaterialSelectionFooter
						selectedCount={selectedCount}
						onClearAll={clearAll}
						onConfirm={handleSubmit(openPreview)}
						isConfirmDisabled={isConfirmDisabled}
					/>
				</>
			)}

			{currentView === MATERIAL_SELECTION_VIEW.PREVIEW && (
				<PreviewRequestView
					previewItems={previewItems}
					handlePreviewBack={handlePreviewBack}
					onCancel={handleCancelRequest}
					handleAddAnotherItem={handleAddAnotherItem}
					handleSubmit={handleSubmit}
					handleSubmitRequest={handleSubmitRequest}
					handleSubmitInvalid={handleSubmitInvalid}
					isSubmitting={isSubmitting}
					onDeleteItem={handleDeletePreviewItem}
				/>
			)}

			{currentView === MATERIAL_SELECTION_VIEW.SUCCESS && (
				<div className="flex-1 overflow-y-auto px-4 py-6">
					<RequestSuccessView requestResult={requestResult} closeSuccessModal={closeSuccessModal} />
				</div>
			)}

			<Modal />
		</div>
	);
}
