import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TRAVEL_PAY_REQUEST_FILTER_STATUS } from "../types";
import { useTravelPayParams } from "../hooks/useTravelPayParams";
import { Check } from "lucide-react";
import { formatSnakeCase } from "@/lib/utils/value-formatter";

const TravelPayFilter = () => {
	const { getParams, setParams } = useTravelPayParams();
	const { status: paramStatus } = getParams();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
					variant={"outline"}
				>
					<Image
						src={"/assets/svg/filter.svg"}
						alt={"filter"}
						width={28}
						height={28}
						className="3xl:h-[56px] 3xl:w-[56px]"
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				{Object.values(TRAVEL_PAY_REQUEST_FILTER_STATUS)?.map((status) => {
					const isSelected = paramStatus === status;
					return (
						<DropdownMenuItem onClick={() => setParams({ status: status })} key={status}>
							{formatSnakeCase(status)}
							{isSelected && <Check />}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default TravelPayFilter;
