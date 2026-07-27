"use client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JOB_STATUS_OPTIONS } from "../types";
import { useBuilderCommsParams } from "../hooks/useAdminProjectListWithImagesAndNotesParams";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function StatusFilterDropdown() {
	const { getParams, setParams } = useBuilderCommsParams();
	const { status } = getParams();

	return (
		<DropdownMenu>
			{/* Trigger */}
			<DropdownMenuTrigger asChild>
				<Button variant={"outline"} className="border-none bg-white shadow-sm">
					<span className="font-normal text-brand-dark80">{status || "Status"}</span>
					<FiChevronDown />
				</Button>
			</DropdownMenuTrigger>

			{/* Content */}
			<DropdownMenuContent align="end" className="w-40">
				{JOB_STATUS_OPTIONS.map((s) => {
					const isSelected = status === s;

					return (
						<DropdownMenuItem
							key={s}
							onClick={() => {
								setParams({ status: isSelected ? undefined : s });
							}}
							className="flex items-center justify-between"
						>
							<span>{s}</span>
							{isSelected && <FiCheck className="text-black" />}
						</DropdownMenuItem>
					);
				})}

				{/* Clear */}
				<DropdownMenuItem
					className="mt-2 border-t text-brand-red hover:!bg-brand-red100 hover:!text-brand-red"
					onClick={() => setParams({ status: undefined }, false)}
				>
					Clear filter
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
