"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import ErrorMessageComponent from "@/components/get-error-message";
import { useModal } from "@/hooks/useModal";
import { SubContractorMissingItemModalContent } from "@/module/job/material-selection/components/subcontractor-missing-item-modal-content";
import MaterialSelectionSearch from "../components/material-selection-search";
import MaterialSelectionList from "../components/material-selection-list";
import MaterialSelectionFooter from "../components/material-selection-footer";
import MaterialSelectionHeader from "../components/material-selection-header";
import PreviewRequestView from "../components/material-selection-preview-request";
import RequestSuccessView from "../components/material-selection-request-success";
import {
	useSubContractorPullList,
	useCreateSubContractorMaterialSelectionRequest,
} from "../hooks/useSubContractorPullList";
import {
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
import type {
	MaterialSelectionItem,
	MaterialSelectionSubmitResponse,
	SubContractorMaterialSelectionSubmitPayload,
} from "../utils/types";
import {
	subcontractorMaterialSelectionFormSchema,
	type IMaterialSelectionFormSchema,
	type ISubcontractorMaterialSelectionFormSchema,
} from "../utils/material-selection-form";
import type { PreviewRequestViewProps } from "../utils/types";
import { routes } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useHandleFileUpload } from "@/hooks/useFile";
import { MATERIAL_SELECTION_VIEW } from "../utils/enums";

// Cast helpers so shared components (typed for employee schema) can be reused
type EmployeeFormItems = IMaterialSelectionFormSchema["items"];
type EmployeeHandleSubmit = PreviewRequestViewProps["handleSubmit"];
type EmployeeHandleSubmitRequest = PreviewRequestViewProps["handleSubmitRequest"];

export default function SubContractorMaterialSelectionTemplate({ isAdmin = true }: { isAdmin?: boolean }) {
	const { id: jobDailyRecordId } = useParams<{ id: string }>();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [currentView, setCurrentView] = useState<
		MATERIAL_SELECTION_VIEW.SELECTION | MATERIAL_SELECTION_VIEW.PREVIEW | MATERIAL_SELECTION_VIEW.SUCCESS
	>(MATERIAL_SELECTION_VIEW.SELECTION);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [requestResult, setRequestResult] = useState<MaterialSelectionSubmitResponse | null>(null);
	const { openModal, closeModal, Modal } = useModal();

	const { control, getValues, handleSubmit, resetField, setValue, formState } =
		useForm<ISubcontractorMaterialSelectionFormSchema>({
			defaultValues: { jobDailyRecordId, items: [] },
			resolver: zodResolver(subcontractorMaterialSelectionFormSchema),
			mode: "onChange",
		});

	const { append, replace } = useFieldArray({ control, name: "items", keyName: "fieldId" });
	const { mutateAsync: createMaterialSelectionRequest } = useCreateSubContractorMaterialSelectionRequest();
	const { getSignedUrls, getFilesToUpload, handleFileUpload } = useHandleFileUpload();

	const {
		data: pullListData,
		isLoading: isPullListLoading,
		isError: isPullListError,
		error: pullListError,
	} = useSubContractorPullList({ jobDailyRecordId });

	const addendumReferenceOptions = pullListData?.addendumReferenceOptions ?? [];
	const workOrderOptions = pullListData?.workOrderOptions ?? [];
	const reasonAvailability = pullListData?.reasonAvailability;
	const items = useMemo(() => mapPullListItemsToMaterials(pullListData?.items ?? []), [pullListData?.items]);
	const takeoffItems = useMemo(
		() => mapTakeoffItemsToMaterials(pullListData?.takeoffItems ?? [], pullListData?.items ?? []),
		[pullListData?.takeoffItems, pullListData?.items]
	);

	const watchedItems = useWatch({ control, name: "items" });
	const formItems = useMemo(() => (watchedItems ?? []) as unknown as EmployeeFormItems, [watchedItems]);

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
			if (existingIndex === -1) append({ ...item, quantity: "", reason: "" });
			return;
		}
		if (existingIndex !== -1) replace(currentItems.filter((entry) => entry.partId !== item.partId));
	};

	const clearAll = () => {
		replace([]);
		setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
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

	const onReasonChange = (index: number, reason: string) => clearReasonSpecificFields(index, reason);

	const openViewMissingItemRequests = () => {
		router.push(
			isAdmin ? routes.subContractor.adminMissingItemRequests : routes.subContractor.crewLeaderMissingItemRequests
		);
	};

	const openMissingItemModal = () => {
		openModal({
			modalTitle: "Request an Unknown Item",
			subHeader: "Your request will be sent to foreman for review",
			modalView: <SubContractorMissingItemModalContent jobDailyRecordId={jobDailyRecordId} onClose={closeModal} />,
			variant: "default",
			showDefaultClose: true,
		});
	};

	const isConfirmDisabled = useMemo(() => {
		if (selectedCount === 0) return true;
		return formItems.some((item) => !isItemReadyForConfirm(item));
	}, [formItems, selectedCount]);

	const buildPayload = (
		data: ISubcontractorMaterialSelectionFormSchema
	): SubContractorMaterialSelectionSubmitPayload => ({
		jobDailyRecordId: data.jobDailyRecordId,
		items: data.items.map((item) =>
			getIMaterialSelectionItemPayload(item as IMaterialSelectionFormSchema["items"][number])
		),
	});

	const openPreview = () => setCurrentView(MATERIAL_SELECTION_VIEW.PREVIEW);
	const handlePreviewBack = () => setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
	const handleAddAnotherItem = () => setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);

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

	const handleDeletePreviewItem = (partId: string) => {
		const currentItems = getValues("items") ?? [];
		const updated = currentItems.filter((entry) => entry.partId !== partId);
		replace(updated);
		if (updated.length === 0) {
			setCurrentView(MATERIAL_SELECTION_VIEW.SELECTION);
		}
	};

	const handleSubmitRequest = async (data: ISubcontractorMaterialSelectionFormSchema) => {
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

			const resolvedData: ISubcontractorMaterialSelectionFormSchema = {
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
		setValue("jobDailyRecordId", jobDailyRecordId);
	}, [jobDailyRecordId, setValue]);

	if (isPullListError) return ErrorMessageComponent({ error: pullListError });

	return (
		<div className="flex h-screen flex-col bg-brand-bgLightgrey">
			{currentView === MATERIAL_SELECTION_VIEW.SELECTION && (
				<>
					<div className="shrink-0 space-y-4 px-4 pt-4">
						<MaterialSelectionHeader
							onAddMissingItemRequest={openMissingItemModal}
							onViewMissingItemRequests={openViewMissingItemRequests}
						/>
						<MaterialSelectionSearch value={query} onChange={setQuery} />
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
						<MaterialSelectionList
							items={filteredItems}
							selectedById={selectedById}
							selectedIndexById={selectedIndexById}
							formItems={formItems}
							control={control as unknown as Parameters<typeof MaterialSelectionList>[0]["control"]}
							onToggle={toggleItem}
							onReasonChange={onReasonChange}
							addendumOptions={addendumReferenceOptions}
							workOrderOptions={workOrderOptions}
							reasonAvailability={reasonAvailability}
							errors={formState.errors as Parameters<typeof MaterialSelectionList>[0]["errors"]}
							isLoading={isPullListLoading}
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
					handleSubmit={handleSubmit as unknown as EmployeeHandleSubmit}
					handleSubmitRequest={handleSubmitRequest as unknown as EmployeeHandleSubmitRequest}
					handleSubmitInvalid={handleSubmitInvalid}
					isSubmitting={isSubmitting}
					onDeleteItem={handleDeletePreviewItem}
				/>
			)}

			{currentView === MATERIAL_SELECTION_VIEW.SUCCESS && (
				<div className="flex-1 overflow-y-auto px-4 py-4">
					<RequestSuccessView requestResult={requestResult} closeSuccessModal={closeSuccessModal} />
				</div>
			)}

			<Modal />
		</div>
	);
}
