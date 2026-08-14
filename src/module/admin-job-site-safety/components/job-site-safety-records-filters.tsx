"use client";

import { FiChevronDown, FiSearch } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { REPORT_SOURCE, SAFETY_REPORT_STATUS } from "@/module/employee-safety/enums";
import { JOB_SITE_SAFETY_REPORT_TYPE } from "../enums";
import {
	JOB_SITE_SAFETY_REPORT_TYPE_LABEL,
	REPORT_SOURCE_LABEL,
	SAFETY_REPORT_STATUS_META,
} from "../utils/dashboard-constants";

const TYPE_FILTER_OPTIONS = Object.values(JOB_SITE_SAFETY_REPORT_TYPE).map((value) => ({
	value,
	label: JOB_SITE_SAFETY_REPORT_TYPE_LABEL[value],
}));
const SOURCE_FILTER_OPTIONS = Object.values(REPORT_SOURCE).map((value) => ({
	value,
	label: REPORT_SOURCE_LABEL[value],
}));
const STATUS_FILTER_OPTIONS = Object.values(SAFETY_REPORT_STATUS).map((value) => ({
	value,
	label: SAFETY_REPORT_STATUS_META[value].label,
}));

const MultiFilterSelect = <T extends string>({
	label,
	selected,
	options,
	onChange,
}: {
	label: string;
	selected: T[];
	options: { value: T; label: string }[];
	onChange: (values: T[]) => void;
}) => {
	const toggle = (value: T) =>
		onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

	const summary =
		selected.length === 0
			? "All"
			: selected.length === 1
				? (options.find((option) => option.value === selected[0])?.label ?? "1")
				: `${selected.length} selected`;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex h-10 w-auto min-w-[130px] max-w-[220px] items-center justify-between gap-2 rounded-[10px] border border-brand-dark10 bg-white px-3 text-sm text-brand-dark"
				>
					<span className="truncate">
						{label}: {summary}
					</span>
					<FiChevronDown size={16} className="shrink-0 text-brand-dark50" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-[240px] p-1">
				{options.map((option) => (
					<label
						key={option.value}
						className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1.5 text-sm hover:bg-brand-bgLightgrey"
					>
						<Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
						{option.label}
					</label>
				))}
			</PopoverContent>
		</Popover>
	);
};

const JobSiteSafetyRecordsFilters = ({
	search,
	typeFilter,
	sourceFilter,
	statusFilter,
	showResolvedClosed,
	onChange,
}: {
	search: string;
	typeFilter: JOB_SITE_SAFETY_REPORT_TYPE[];
	sourceFilter: REPORT_SOURCE[];
	statusFilter: SAFETY_REPORT_STATUS[];
	showResolvedClosed: boolean;
	onChange: (params: {
		search?: string;
		typeFilter?: JOB_SITE_SAFETY_REPORT_TYPE[];
		sourceFilter?: REPORT_SOURCE[];
		statusFilter?: SAFETY_REPORT_STATUS[];
		showResolvedClosed?: boolean;
	}) => void;
}) => (
	<div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
		<div className="relative">
			<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
			<input
				type="text"
				placeholder="Search by employee, source, job site"
				className="h-10 w-full rounded-[10px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm shadow-sm outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark sm:w-[360px]"
				value={search}
				onChange={(event) => onChange({ search: event.target.value })}
			/>
		</div>

		<div className="flex flex-wrap items-center gap-2">
			<MultiFilterSelect
				label="Type"
				selected={typeFilter}
				options={TYPE_FILTER_OPTIONS}
				onChange={(values) => onChange({ typeFilter: values })}
			/>
			<MultiFilterSelect
				label="Source"
				selected={sourceFilter}
				options={SOURCE_FILTER_OPTIONS}
				onChange={(values) => onChange({ sourceFilter: values })}
			/>
			<MultiFilterSelect
				label="Statuses"
				selected={statusFilter}
				options={STATUS_FILTER_OPTIONS}
				onChange={(values) => onChange({ statusFilter: values })}
			/>
			<label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-brand-dark">
				Show resolved &amp; closed
				<Switch checked={showResolvedClosed} onCheckedChange={(checked) => onChange({ showResolvedClosed: checked })} />
			</label>
		</div>
	</div>
);

export default JobSiteSafetyRecordsFilters;
