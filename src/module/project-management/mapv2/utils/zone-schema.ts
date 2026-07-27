import { z } from "zod";
import { MAP_ZONE_CREATE_MODE, MAP_ZONE_TYPE } from "./enums";
import { MAX_ZONE_POLYGON_POINTS, MIN_ZONE_POLYGON_POINTS } from "./constants";

export const mapZoneFormSchema = z
	.object({
		name: z.string().min(1, "Zone name is required"),
		mapZoneTypeId: z.string().min(1, "Select a zone type"),
		mode: z.nativeEnum(MAP_ZONE_CREATE_MODE),
		address: z.string().optional(),
		city: z.string().optional(),
		state: z.string().optional(),
		zipcode: z.string().optional(),
		country: z.string().optional(),
		points: z.array(z.object({ X: z.number(), Y: z.number() })).optional(),
		// kept as strings to match FIELD_VARIANT.SEARCHABLE_SELECT option values; converted to
		// numbers only when building the API payload (see zone-form-modal.tsx)
		empNum: z.string().optional(),
		projectRecnum: z.string().optional(),
	})
	.superRefine((values, ctx) => {
		const isEmployeeType = values.mapZoneTypeId === MAP_ZONE_TYPE.EMPLOYEE;
		const isProjectType = values.mapZoneTypeId === MAP_ZONE_TYPE.PROJECT;

		if (isEmployeeType && !values.empNum) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["empNum"], message: "Select an employee" });
		}

		if (isProjectType && !values.projectRecnum) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["projectRecnum"], message: "Select a project" });
		}

		// No special-casing needed for Employee/Project here: when the picked record has an
		// address, `address` is auto-filled and this passes; when it doesn't, the form falls back
		// to manual address/polygon entry (see zone-form-modal.tsx) and this enforces it same as
		// any other zone type.
		if (values.mode === MAP_ZONE_CREATE_MODE.ADDRESS && !values.address?.trim()) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Address is required" });
		}

		if (values.mode === MAP_ZONE_CREATE_MODE.POLYGON) {
			const count = values.points?.length ?? 0;
			if (count < MIN_ZONE_POLYGON_POINTS || count > MAX_ZONE_POLYGON_POINTS) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["points"],
					message: `Draw a polygon with ${MIN_ZONE_POLYGON_POINTS}-${MAX_ZONE_POLYGON_POINTS} points`,
				});
			}
		}
	});

export type IMapZoneFormSchema = z.infer<typeof mapZoneFormSchema>;
