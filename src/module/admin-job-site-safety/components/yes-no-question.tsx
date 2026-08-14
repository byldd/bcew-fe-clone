import { Label } from "@/components/ui/label";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { YES_NO } from "@/module/employee-safety/enums";

// A standalone Yes/No question kept outside the reused job-site-injury form
// schema (its answer only ever derives `medicalAction`, it isn't persisted
// as its own field), so it's a small local field rather than a FIELD_VARIANT.
const YesNoQuestion = ({
	label,
	value,
	onChange,
	error,
}: {
	label: string;
	value?: YES_NO;
	onChange: (value: YES_NO) => void;
	error?: string;
}) => {
	const id = label.toLowerCase().replace(/\s+/g, "-");

	return (
		<div className="space-y-2 py-1">
			<FormLabelRequired label={label} required className="my-1 font-inter text-sm font-normal text-brand-grey" />
			<RadioGroup value={value} onValueChange={onChange} className="flex items-center gap-6">
				<div className="flex items-center space-x-2">
					<RadioGroupItem value={YES_NO.YES} id={`${id}-yes`} />
					<Label htmlFor={`${id}-yes`}>Yes</Label>
				</div>
				<div className="flex items-center space-x-2">
					<RadioGroupItem value={YES_NO.NO} id={`${id}-no`} />
					<Label htmlFor={`${id}-no`}>No</Label>
				</div>
			</RadioGroup>
			{error && <p className="text-xs text-brand-red">{error}</p>}
		</div>
	);
};

export default YesNoQuestion;
