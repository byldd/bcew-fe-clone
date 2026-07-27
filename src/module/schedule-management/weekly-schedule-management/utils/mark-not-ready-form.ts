import { getFileMimeType } from "@/lib/utils/file";
import { ALLOWED_IMAGE_FILE_TYPES } from "@/utils/constants";
import z from "zod";

/**
 * When Admin mark a job as not ready.
 */
export const getImageSchema = (allowedFileTypes: string[] = ALLOWED_IMAGE_FILE_TYPES) =>
	z.object({
		keyFile: z.string().min(1, { message: "File is required" }),
		url: z.string(),
		file:
			typeof window === "undefined"
				? z.any()
				: z
						.instanceof(File)
						.nullable()
						.refine((file) => allowedFileTypes.includes(getFileMimeType(file ?? undefined)), {
							message: "File format is not supported",
						})
						.optional(),
	});

export const markNotReadyFormSchema = z.object({
	isReady: z.boolean(),
	isClean: z.boolean(),
	updateForCrew: z.string(),
	sendSms: z.boolean().optional(),
	images: z.array(getImageSchema()).optional(),
	note: z.string().optional(),
});

export type IMarkNotReadyFormSchema = z.infer<typeof markNotReadyFormSchema>;
