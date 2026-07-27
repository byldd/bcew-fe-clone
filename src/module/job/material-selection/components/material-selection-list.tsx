import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/shared/image-upload/image-upload";
import { MaterialSelectionListProps, MaterialSelectionItem } from "../utils/types";
import { MATERIAL_AVAILABILITY } from "../utils/enums";
import {
	getMaterialSelectionReasonOptions,
	isAddendumReason,
	isDamagedReason,
	isPullListIssueReason,
	isNoteOnlyReason,
	isPhotoNoteReason,
	isWarrantyReason,
	MATERIAL_SELECTION_REASON_KEYS,
} from "../utils";
import { Spinner } from "@/components/ui/spinner";
import MaterialQuantityBadges from "./material-quantity-badges";

export default function MaterialSelectionList({
	items,
	selectedById,
	selectedIndexById,
	formItems,
	control,
	onToggle,
	onReasonChange,
	addendumOptions,
	workOrderOptions,
	reasonAvailability,
	errors,
	isLoading,
	twoColumn,
	canSelectAddendum,
}: MaterialSelectionListProps) {
	if (isLoading) return <Spinner />;

	const availableReasonOptions = getMaterialSelectionReasonOptions(reasonAvailability, canSelectAddendum);

	const renderCard = (item: MaterialSelectionItem) => {
		const isSelected = Boolean(selectedById[item.partId]);
		const selectedIndex = selectedIndexById[item.partId];
		const currentItem = selectedIndex !== undefined ? formItems[selectedIndex] : undefined;
		const currentReason = currentItem?.reason ?? "";
		const isPullListIssue = isPullListIssueReason(currentReason);
		const isAddendum = isAddendumReason(currentReason);
		const isWarranty = isWarrantyReason(currentReason);
		const isDamaged = isDamagedReason(currentReason);
		const isDefective = currentReason === MATERIAL_SELECTION_REASON_KEYS.DEFECTIVE;
		const isMissingParts = currentReason === MATERIAL_SELECTION_REASON_KEYS.MISSING_PARTS;
		const isPhotoNote = isPhotoNoteReason(currentReason);
		const isNoteOnly = isNoteOnlyReason(currentReason);
		const itemErrors = selectedIndex !== undefined ? errors?.items?.[selectedIndex] : undefined;
		const partIssue = isDefective ? "Defective Parts" : isMissingParts ? "Missing Parts" : "Damaged Parts";
		const filteredWorkOrderOptions = workOrderOptions.filter((option) => {
			const label = option.label.toLowerCase();
			if (currentReason === MATERIAL_SELECTION_REASON_KEYS.WARRANTY) return !label.includes("jobbing");
			if (currentReason === MATERIAL_SELECTION_REASON_KEYS.JOBBING) return !label.includes("warranty");
			return true;
		});

		return (
			<div
				key={item.partId}
				className="flex items-start gap-3 rounded-[12px] border border-brand-dark10 bg-white px-3 py-3"
			>
				<Checkbox
					checked={isSelected}
					onCheckedChange={(checked) => onToggle(item, checked === true)}
					className="mt-1"
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="text-xs font-semibold text-brand-dark50">({item.code})</p>
							<p className="text-sm font-semibold text-brand-dark">{item.name}</p>
						</div>
						<div className="flex shrink-0 flex-col items-end gap-1">
							<MaterialQuantityBadges
								orders={item.orders}
								checked={item.checked}
								received={item.received}
								backorder={item.backorder}
							/>
							<div className="text-right text-[10px] font-medium text-brand-dark50">
								<span className="text-xs">{item.phase}</span>
								<span className="mx-1">•</span>
								<span className="text-xs">{item.vendor}</span>
								<span className="mx-1">•</span>
								<span
									className={
										item.stockStatus === MATERIAL_AVAILABILITY.IN_STOCK
											? "text-xs text-emerald-600"
											: "text-xs text-rose-500"
									}
								>
									{item.stockStatus}
								</span>
							</div>
						</div>
					</div>
					{isSelected && selectedIndex !== undefined && (
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<Controller
								control={control}
								name={`items.${selectedIndex}.quantity`}
								render={({ field }) => (
									<Input
										type="number"
										min={0}
										placeholder="Enter Quantity"
										value={field.value ?? ""}
										onChange={(event) => field.onChange(event.target.value)}
										className="h-9 w-[140px] rounded-[8px] bg-[#F5F5F5]"
									/>
								)}
							/>
							<Controller
								control={control}
								name={`items.${selectedIndex}.reason`}
								render={({ field }) => (
									<Select
										value={field.value ?? ""}
										onValueChange={(value) => {
											field.onChange(value);
											onReasonChange(selectedIndex, value);
										}}
									>
										<SelectTrigger className="h-9 w-[160px] rounded-[8px] bg-[white] shadow-sm">
											<SelectValue placeholder="Reason" />
										</SelectTrigger>
										<SelectContent
											position="popper"
											side="bottom"
											align="start"
											sideOffset={4}
											collisionPadding={16}
											className="z-[9999] w-[320px] max-w-[calc(100vw-32px)]"
										>
											{availableReasonOptions.map((reason) => (
												<SelectItem
													key={reason.value}
													value={reason.value}
													//addendum is temporarily disabled
													disabled={"disabled" in reason ? reason.disabled : undefined}
													className="whitespace-normal break-words pr-8"
												>
													{reason.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{itemErrors?.quantity?.message && (
								<p className="w-full text-[10px] font-medium text-rose-500">{itemErrors.quantity.message}</p>
							)}
							{itemErrors?.reason?.message && (
								<p className="w-full text-[10px] font-medium text-rose-500">{itemErrors.reason.message}</p>
							)}
						</div>
					)}
					{isSelected && selectedIndex !== undefined && isPullListIssue && (
						<div className="mt-4 space-y-3">
							<div className="space-y-1">
								<p className="text-xs font-medium text-brand-dark50">What quantity did you receive?</p>
								<div className="flex flex-wrap items-center gap-2">
									<Controller
										control={control}
										name={`items.${selectedIndex}.receivedInput`}
										render={({ field }) => (
											<Input
												type="number"
												min={1}
												aria-label="Received quantity"
												placeholder="Enter number"
												value={field.value ?? ""}
												onChange={(event) => field.onChange(event.target.value)}
												className="h-9 w-[120px] rounded-[10px] bg-[#F5F5F5]"
											/>
										)}
									/>
								</div>
								{itemErrors?.receivedInput?.message && (
									<p className="text-[10px] text-rose-500">{itemErrors.receivedInput.message}</p>
								)}
							</div>
							<div className="space-y-1">
								<p className="text-xs font-medium text-brand-dark50">Add a note</p>
								<Controller
									control={control}
									name={`items.${selectedIndex}.note`}
									render={({ field }) => (
										<Textarea
											placeholder="Type here"
											value={field.value ?? ""}
											onChange={(event) => field.onChange(event.target.value)}
											className="min-h-[90px] rounded-[10px] bg-[#F5F5F5] text-xs"
										/>
									)}
								/>
								{itemErrors?.note?.message && <p className="text-[10px] text-rose-500">{itemErrors.note.message}</p>}
							</div>
						</div>
					)}
					{isSelected && selectedIndex !== undefined && isNoteOnly && (
						<div className="mt-2 space-y-1">
							<p className="text-xs font-medium text-brand-dark50">Add a Note*</p>
							<Controller
								control={control}
								name={`items.${selectedIndex}.note`}
								render={({ field }) => (
									<Textarea
										placeholder="Type here"
										value={field.value ?? ""}
										onChange={(event) => field.onChange(event.target.value)}
										className="min-h-[90px] rounded-[10px] bg-[#F5F5F5] text-xs"
									/>
								)}
							/>
							{itemErrors?.note?.message && <p className="text-[10px] text-rose-500">{itemErrors.note.message}</p>}
						</div>
					)}
					{isSelected && selectedIndex !== undefined && isPhotoNote && (
						<div className="mt-4 space-y-1">
							<p className="text-xs font-medium text-brand-dark50">
								Add Photos of Installation Place And Include A Note Below*
							</p>
							<Controller
								control={control}
								name={`items.${selectedIndex}.images`}
								render={({ field }) => <ImageUpload value={field.value || []} onChange={field.onChange} label="" />}
							/>
							<Controller
								control={control}
								name={`items.${selectedIndex}.note`}
								render={({ field }) => (
									<Textarea
										placeholder="Type here"
										value={field.value ?? ""}
										onChange={(event) => field.onChange(event.target.value)}
										className="min-h-[90px] rounded-[10px] bg-[#F5F5F5] text-xs"
									/>
								)}
							/>
							{itemErrors?.images?.message && <p className="text-[10px] text-rose-500">{itemErrors.images.message}</p>}
							{itemErrors?.note?.message && <p className="text-[10px] text-rose-500">{itemErrors.note.message}</p>}
						</div>
					)}
					{isSelected && selectedIndex !== undefined && isAddendum && (
						<div className="mt-4 space-y-2">
							<p className="text-xs font-medium text-brand-dark50">
								Please select Addendum Reference Number and add a note
							</p>
							<Controller
								control={control}
								name={`items.${selectedIndex}.referenceId`}
								render={({ field }) => (
									<Select
										value={field.value ?? ""}
										onValueChange={field.onChange}
										disabled={Boolean(isLoading) || addendumOptions.length === 0}
									>
										<SelectTrigger className="h-9 w-[220px]">
											<SelectValue placeholder="Please select Reference ID" />
										</SelectTrigger>
										<SelectContent>
											{addendumOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<Controller
								control={control}
								name={`items.${selectedIndex}.note`}
								render={({ field }) => (
									<Textarea
										placeholder="Type here"
										value={field.value ?? ""}
										onChange={(event) => field.onChange(event.target.value)}
										className="min-h-[90px] rounded-[10px] bg-[#F5F5F5] text-xs"
									/>
								)}
							/>
							{itemErrors?.referenceId?.message && (
								<p className="text-[10px] text-rose-500">{itemErrors.referenceId.message}</p>
							)}
							{itemErrors?.note?.message && <p className="text-[10px] text-rose-500">{itemErrors.note.message}</p>}
						</div>
					)}
					{isSelected && selectedIndex !== undefined && isWarranty && (
						<div className="mt-4 space-y-2">
							<p className="text-xs font-medium text-brand-dark50">Please select Work Order Number and add a note</p>
							<Controller
								control={control}
								name={`items.${selectedIndex}.workOrderNumber`}
								render={({ field }) => (
									<Select
										value={field.value ?? ""}
										onValueChange={field.onChange}
										disabled={Boolean(isLoading) || filteredWorkOrderOptions.length === 0}
									>
										<SelectTrigger className="h-9 w-[220px]">
											<SelectValue placeholder="Please select Work Order Number" />
										</SelectTrigger>
										<SelectContent>
											{filteredWorkOrderOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<Controller
								control={control}
								name={`items.${selectedIndex}.note`}
								render={({ field }) => (
									<Textarea
										placeholder="Type here"
										value={field.value ?? ""}
										onChange={(event) => field.onChange(event.target.value)}
										className="min-h-[90px] rounded-[10px] bg-[#F5F5F5] text-xs"
									/>
								)}
							/>
							{itemErrors?.workOrderNumber?.message && (
								<p className="text-[10px] text-rose-500">{itemErrors.workOrderNumber.message}</p>
							)}
							{itemErrors?.note?.message && <p className="text-[10px] text-rose-500">{itemErrors.note.message}</p>}
						</div>
					)}
					{isSelected && selectedIndex !== undefined && isDamaged && (
						<div className="mt-4 space-y-2">
							<p className="text-xs font-medium text-brand-dark50">
								{`Add Photos Of ${partIssue} And Include A Note Below`}
							</p>
							<Controller
								control={control}
								name={`items.${selectedIndex}.images`}
								render={({ field }) => <ImageUpload value={field.value || []} onChange={field.onChange} label="" />}
							/>
							<Controller
								control={control}
								name={`items.${selectedIndex}.note`}
								render={({ field }) => (
									<Textarea
										placeholder="Type here"
										value={field.value ?? ""}
										onChange={(event) => field.onChange(event.target.value)}
										className="min-h-[90px] rounded-[10px] bg-[#F5F5F5] text-xs"
									/>
								)}
							/>
							{itemErrors?.images?.message && <p className="text-[10px] text-rose-500">{itemErrors.images.message}</p>}
							{itemErrors?.note?.message && <p className="text-[10px] text-rose-500">{itemErrors.note.message}</p>}
						</div>
					)}
				</div>
			</div>
		);
	};

	const renderItems = (list: MaterialSelectionItem[]) => {
		if (twoColumn) {
			const leftItems = list.filter((_, index) => index % 2 === 0);
			const rightItems = list.filter((_, index) => index % 2 === 1);
			return (
				<div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
					<div className="flex flex-col gap-2">{leftItems.map(renderCard)}</div>
					<div className="flex flex-col gap-2">{rightItems.map(renderCard)}</div>
				</div>
			);
		}
		return <div className="space-y-2">{list.map(renderCard)}</div>;
	};

	const pullListItems = items.filter((item) => item.inPullList !== false);
	const notInPullListItems = items.filter((item) => item.inPullList === false);

	if (items.length === 0) {
		return (
			<div className="mt-5 space-y-1">
				<p className="text-base font-medium text-brand-dark50">Pull List</p>
				<div className="rounded-[12px] border border-brand-dark10 bg-white px-4 py-6 text-center text-sm text-brand-dark50">
					No matching items.
				</div>
			</div>
		);
	}

	return (
		<div className="mt-5 space-y-4">
			{pullListItems.length > 0 && (
				<div className="space-y-1">
					<p className="text-base font-medium text-brand-dark50">Pull List</p>
					{renderItems(pullListItems)}
				</div>
			)}
			{notInPullListItems.length > 0 && (
				<div className="space-y-1">
					<p className="text-base font-medium text-brand-dark50">Not in Pull List</p>
					{renderItems(notInPullListItems)}
				</div>
			)}
		</div>
	);
}
