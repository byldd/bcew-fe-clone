import { env } from "@/env.mjs";
import { E_APPLICATION, PAGE_POSITION } from "@/module/admin/types/sideb-bar-page";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { z } from "zod";

export const ICON_ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/svg+xml"];

const iconFileSchema = () =>
	z.object({
		keyFile: z.string().min(1, { message: "File is required" }),
		url: z.string(),
		file:
			typeof window === "undefined"
				? z.any()
				: z
						.instanceof(File)
						.nullable()
						.refine((file) => ICON_ALLOWED_FILE_TYPES.includes(file?.type || ""), {
							message: "File format is not supported",
						})
						.optional(),
	});

export const pageFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	parentPageId: z.string().optional(),
	urlEndpoint: z.string().optional(),
	rolePagePermissions: z.array(
		z.object({
			roleId: z.string(),
			accessLevel: z.nativeEnum(ACCESS_LEVEL).nullable(),
		})
	),
	positionFixed: z.nativeEnum(PAGE_POSITION).nullable(),
	sortOrder: z.number().optional(),
	iconUrl: z.string().optional(),
	iconFile: iconFileSchema().optional(),
	application: z.nativeEnum(E_APPLICATION).optional(),
	showInSidebar: z.boolean().optional(),
});

export type IPageFormSchema = z.infer<typeof pageFormSchema>;

export const applicationBaseUrl = {
	[E_APPLICATION.BYLDD]: env.NEXT_PUBLIC_BYLDD_BASE_URL,
	[E_APPLICATION.AKME]: env.NEXT_PUBLIC_AKME_BASE_URL,
	[E_APPLICATION.LEGACY]: env.NEXT_PUBLIC_LEGACY_BASE_URL,
};
