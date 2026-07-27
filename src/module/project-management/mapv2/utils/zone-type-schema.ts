import { z } from "zod";

export const zoneTypeFormSchema = z.object({
	name: z.string().min(1, "Zone type name is required"),
	mapZoneTabId: z.string().min(1, "Select a tab"),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Enter a valid hex color like #3B82F6"),
});

export type IZoneTypeFormSchema = z.infer<typeof zoneTypeFormSchema>;
