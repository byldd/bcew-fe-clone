import { openErrorToast } from "@/components/toast";
import { getTodayDate, toDate } from "@/lib/utils/date";
import { z } from "zod";

export const jobUpdateFormSchema = ({ isSlabRoughJob }: { isSlabRoughJob: boolean }) =>
	z
		.object({
			jobCompleted: z.boolean({
				required_error: "Please select if the job was completed",
			}),

			forecastCompletion: z.boolean().nullable().optional(),

			forecastDate: z.string().optional(),

			jobEmployeeAssignments: z
				.array(
					z.object({
						employeeId: z.string(),
						name: z.string(),
						checked: z.boolean(),
						forecastHours: z.number(),
					})
				)
				.optional(),

			forecastCrew: z
				.array(
					z.object({
						employeeId: z.string(),
						name: z.string().optional(),
						forecastHours: z.number(),
					})
				)
				.optional(),

			note: z.string().optional(),

			images: z
				.array(
					z.object({
						url: z.string(),
						keyFile: z.string(),
						file: z.instanceof(File).optional(),
					})
				)
				.optional(),
		})
		.superRefine((data, ctx) => {
			if (data.jobCompleted === false) {
				if (data.forecastCompletion === null || data.forecastCompletion === undefined) {
					ctx.addIssue({
						path: ["forecastCompletion"],
						code: z.ZodIssueCode.custom,
						message: "Please select forecast completion",
					});
				}
				if (data.forecastCompletion === false && !data.forecastDate) {
					ctx.addIssue({
						path: ["forecastDate"],
						code: z.ZodIssueCode.custom,
						message: "Please select forecast date",
					});
				}
				if (data.forecastDate && data.forecastCompletion === false) {
					const forecast = toDate(data.forecastDate);
					const dayAfterTomorrow = getTodayDate();
					dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

					if (forecast.getTime() < dayAfterTomorrow.getTime()) {
						ctx.addIssue({
							path: ["forecastDate"],
							code: z.ZodIssueCode.custom,
							message: "Invalid date",
						});
						return openErrorToast({ message: "Please select forecast date after tomorrow" });
					}
				}
			}

			if (isSlabRoughJob && data.jobCompleted && !data.images?.length) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Please upload images for slab rough job",
					path: ["images"],
				});
			}
		});

export type IJobUpdateFormSchema = z.infer<ReturnType<typeof jobUpdateFormSchema>>;
