import { z } from "zod";
import {
	isAddendumReason,
	isDamagedReason,
	isMaterialSelectionReasonKey,
	isPullListIssueReason,
	isNoteOnlyReason,
	isWarrantyReason,
} from "./index";

const imageSchema = z.object({
	keyFile: z.string(),
	url: z.string(),
	file: z.any().optional(),
});

const materialSelectionItemSchema = z.object({
	partId: z.string().min(1, "Part ID is required"),
	name: z.string().min(1, "Item name is required"),
	code: z.string().min(1, "Item code is required"),
	phase: z.string().min(1, "Phase is required"),
	vendor: z.string().min(1, "Vendor is required"),
	stockStatus: z.string().min(1, "Stock status is required"),
	orders: z.string(),
	checked: z.string(),
	received: z.string(),
	backorder: z.string(),
	quantity: z.string().min(1, "Quantity is required"),
	reason: z.string().min(1, "Reason is required").refine(isMaterialSelectionReasonKey, "Reason is invalid"),
	pullListConfirmed: z.string().optional(),
	additionalQuantity: z.string().optional(),
	receivedInput: z.string().optional(),
	needed: z.string().optional(),
	note: z.string().optional(),
	referenceId: z.string().optional(),
	workOrderNumber: z.string().optional(),
	inPullList: z.boolean().optional(),
	images: z.array(imageSchema).optional(),
});

type MaterialSelectionItemInput = z.infer<typeof materialSelectionItemSchema>;

function applyItemRefinements(items: MaterialSelectionItemInput[], ctx: z.RefinementCtx) {
	items.forEach((item, index) => {
		if (isPullListIssueReason(item.reason)) {
			const receivedValue = item.receivedInput;
			if (!receivedValue || Number(receivedValue) <= 0) {
				ctx.addIssue({
					path: ["items", index, "receivedInput"],
					code: z.ZodIssueCode.custom,
					message: "Number is required",
				});
			}
			if (!item.note?.trim()) {
				ctx.addIssue({ path: ["items", index, "note"], code: z.ZodIssueCode.custom, message: "Note is required" });
			}
		}

		if (isAddendumReason(item.reason)) {
			if (!item.referenceId) {
				ctx.addIssue({
					path: ["items", index, "referenceId"],
					code: z.ZodIssueCode.custom,
					message: "Reference ID is required",
				});
			}
			if (!item.note?.trim()) {
				ctx.addIssue({ path: ["items", index, "note"], code: z.ZodIssueCode.custom, message: "Note is required" });
			}
		}

		if (isWarrantyReason(item.reason)) {
			if (!item.workOrderNumber) {
				ctx.addIssue({
					path: ["items", index, "workOrderNumber"],
					code: z.ZodIssueCode.custom,
					message: "Work order number is required",
				});
			}
			if (!item.note?.trim()) {
				ctx.addIssue({ path: ["items", index, "note"], code: z.ZodIssueCode.custom, message: "Note is required" });
			}
		}

		if (isDamagedReason(item.reason)) {
			if (!item.images?.length) {
				ctx.addIssue({
					path: ["items", index, "images"],
					code: z.ZodIssueCode.custom,
					message: "At least one image is required",
				});
			}
			if (!item.note?.trim()) {
				ctx.addIssue({ path: ["items", index, "note"], code: z.ZodIssueCode.custom, message: "Note is required" });
			}
		}

		if (isNoteOnlyReason(item.reason)) {
			if (!item.note?.trim()) {
				ctx.addIssue({ path: ["items", index, "note"], code: z.ZodIssueCode.custom, message: "Note is required" });
			}
		}
	});
}

export const materialSelectionFormSchema = z
	.object({
		assignmentId: z.string().optional(),
		jobnum: z.number().optional(),
		tsknum: z.number().optional(),
		userId: z.string().optional(),
		items: z.array(materialSelectionItemSchema).min(1, "Select at least one item"),
	})
	.superRefine((data, ctx) => {
		applyItemRefinements(data.items, ctx);
	});

export const subcontractorMaterialSelectionFormSchema = z
	.object({
		jobDailyRecordId: z.string(),
		items: z.array(materialSelectionItemSchema).min(1, "Select at least one item"),
	})
	.superRefine((data, ctx) => {
		applyItemRefinements(data.items, ctx);
	});

export type IMaterialSelectionFormSchema = z.infer<typeof materialSelectionFormSchema>;
export type ISubcontractorMaterialSelectionFormSchema = z.infer<typeof subcontractorMaterialSelectionFormSchema>;
