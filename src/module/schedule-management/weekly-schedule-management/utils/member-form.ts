import z from "zod";
import { IQcInspectionForeman } from "../types/qc-job";
import { Option } from "@/components/ui/selectField";

export const changeMemberFormSchema = z.object({
	employeeId: z.string().min(1, "Employee ID is required"),
	stopNumber: z.number().optional().nullable(),
});

export type IChangeMemberFormSchema = z.infer<typeof changeMemberFormSchema>;

export const getFormanOptions = (foreman: IQcInspectionForeman[]): Option[] => {
	return foreman
		.map((foreman) => ({
			value: foreman.deptManager?.employee?.id || "",
			label: foreman.deptManager?.employee?.user?.name || "",
		}))
		.filter((foreman) => foreman.value)
		.filter((foreman, index, self) => index === self.findIndex((t) => t.value === foreman.value)) as Option[];
};
