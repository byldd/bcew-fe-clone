import { Textarea } from "@/components/ui/textarea";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { FormItem, FormMessage } from "@/components/ui/form";
import { IReasonFieldProps } from "../types";

export default function ReasonField({ label, value, onChange }: IReasonFieldProps) {
	return (
		<FormItem className="space-y-1.5">
			<FormLabelRequired label={label} required />
			<div className="px-0.5">
				<Textarea
					className="min-h-20 w-full rounded-lg border border-gray-300 p-2 text-sm"
					placeholder="Type here..."
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
			</div>
			<FormMessage />
		</FormItem>
	);
}
