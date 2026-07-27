import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function MaterialSelectionSearch({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Input
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder="Search by part name or number"
			icon={<Search className="h-4 w-4 text-brand-dark" />}
			className="rounded-[12px] border border-white bg-white"
		/>
	);
}
