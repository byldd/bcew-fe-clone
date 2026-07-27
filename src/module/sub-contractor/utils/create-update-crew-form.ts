import { isValidPhoneNumber } from "react-phone-number-input";
import z from "zod";

export const crewSchema = z.object({
	name: z.string().refine((val) => val.trim().length > 0, {
		message: "Crew name is required",
	}),
	crewLeaderName: z.string().refine((val) => val.trim().length > 0, {
		message: "Crew leader name is required",
	}),
	email: z.string().email("Invalid email address"),
	phoneNumber: z
		.string()
		.min(1, "Phone number is required")
		.refine((value) => isValidPhoneNumber(value), {
			message: "Invalid phone number",
		}),
	pauseAccess: z.boolean(),
	crewEmployees: z.array(z.string()).optional(),
});
