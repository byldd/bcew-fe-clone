"use client";
import React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface DataTablePaginationProps {
	pageSize: number;
	total: number;
	currentPage: number;

	setPageSize: React.Dispatch<React.SetStateAction<number>> | ((size: number) => void);
	setPage: React.Dispatch<React.SetStateAction<number>> | ((page: number) => void);
}

export function DataTablePagination({ pageSize, setPageSize, currentPage, total, setPage }: DataTablePaginationProps) {
	const totalPageCount = Math.ceil(total / pageSize);

	return (
		<div className="flex items-center justify-end bg-transparent p-2">
			<div className="flex items-center space-x-6 lg:space-x-8">
				<div className="flex items-center space-x-2">
					<p className="text-sm font-medium">Rows per page</p>
					<Select
						value={`${pageSize}`}
						onValueChange={(value) => {
							setPageSize(Number(value));
						}}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{[10, 20, 25, 30, 40, 50].map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-[100px] items-center justify-center text-sm font-medium">
					Page {currentPage} of {totalPageCount}
				</div>
				<div className="flex gap-3">
					<div>
						<ChevronLeft
							className={`cursor-pointer ${currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}`}
							onClick={() => {
								if (currentPage > 1) {
									setPage(currentPage - 1);
								}
							}}
						/>
					</div>
					<div>
						<ChevronRight
							className={`cursor-pointer ${currentPage === totalPageCount ? "cursor-not-allowed opacity-50" : ""}`}
							onClick={() => {
								if (currentPage < totalPageCount) {
									setPage(currentPage + 1);
								}
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
