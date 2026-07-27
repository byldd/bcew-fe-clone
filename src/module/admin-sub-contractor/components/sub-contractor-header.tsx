"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type SubContractorHeaderProps = {
	search: string;
	onSearchChange: (value: string) => void;
};

const SubContractorHeader = ({ search, onSearchChange }: SubContractorHeaderProps) => {
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	return (
		<div className="datatable-header mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
			<SectionHeader title={tPmanagement.subContractor} />
			<div className="w-[220px] sm:w-auto">
				<Input
					className="h-10 w-full bg-white sm:w-[220px]"
					icon={<Search className="h-4 w-4 text-muted-foreground" />}
					iconPosition="left"
					placeholder={tPmanagement.searchByCrewName}
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>
		</div>
	);
};

export default SubContractorHeader;
