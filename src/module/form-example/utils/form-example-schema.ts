import { z } from "zod";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";

export const formExampleSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	bio: z.string().max(200, "Bio must be under 200 characters").optional(),
	department: z.string().min(1, "Select a department"),
	skills: z.array(z.string()).min(1, "Select at least one skill"),
	country: z.string().min(1, "Select a country"),
	gender: z.string().min(1, "Select a gender"),
	joiningDate: z.date({ required_error: "Joining date is required" }),
	salary: z.coerce.number({ invalid_type_error: "Salary is required" }).min(1, "Salary is required"),
	receiveNotifications: z.boolean(),
	attachments: z.array(getImageSchema()).optional(),
});

export type IFormExampleSchema = z.infer<typeof formExampleSchema>;
