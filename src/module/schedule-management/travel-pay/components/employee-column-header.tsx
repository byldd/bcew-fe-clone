import React from "react";

import { TRAVEL_PAY_REQUEST_SORT } from "../types";
import { useTravelPayParams } from "../hooks/useTravelPayParams";
import { cn } from "@/lib/utils/utils";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

const EmployeeColumnHeader = () => {
	const { getParams, setParams } = useTravelPayParams();
	const { sort: paramSort } = getParams();
	return (
		<div className="flex items-center gap-1">
			<p className="w-full min-w-[95%]">Employee Name</p>
			<div className="flex flex-col gap-0">
				<IoMdArrowDropup
					onClick={() => setParams({ sort: TRAVEL_PAY_REQUEST_SORT.NAME_ASC })}
					className={cn(
						"h-4 w-4",
						paramSort === TRAVEL_PAY_REQUEST_SORT.NAME_ASC ? "text-brand-dark" : "text-gray-400"
					)}
				/>
				<IoMdArrowDropdown
					onClick={() => setParams({ sort: TRAVEL_PAY_REQUEST_SORT.NAME_DESC })}
					className={cn(
						"h-4 w-4",
						paramSort === TRAVEL_PAY_REQUEST_SORT.NAME_DESC ? "text-brand-dark" : "text-gray-400"
					)}
				/>
			</div>
		</div>
	);
};

export default EmployeeColumnHeader;
