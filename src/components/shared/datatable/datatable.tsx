"use client";
import React, { ReactNode } from "react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	ColumnFiltersState,
	SortingState,
	getSortedRowModel,
	getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { DataTablePagination, DataTablePaginationProps } from "./data-table-pagination";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useSearchParams } from "next/navigation";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	paginatorOptions?: DataTablePaginationProps;
	title?: string | ReactNode;
	handleSearch?: (value: string) => void;
	searchValue?: string;
	searchInputClassName?: string;
	filterComponent?: React.ReactNode;
	searchPlaceholder?: string;
	actionButtons?: React.ReactNode[];
	onClick?: (row: TData) => void;
	className?: string;
	isLoading?: boolean;
	useSectionHeader?: boolean;
	rowClassName?: (row: TData) => string;
	showGridLines?: boolean;
	stickyHeaderMode?: boolean;
	compact?: boolean;
	mobileCompact?: boolean;
	enableSorting?: boolean;
}

const TANSTACK_DEFAULT_SIZE = 150;

export function DataTable<TData, TValue>({
	columns,
	data,
	paginatorOptions,
	title,
	handleSearch,
	searchValue,
	searchInputClassName = "w-[240px]",
	filterComponent,
	searchPlaceholder = "Search",
	actionButtons,
	onClick,
	className = "",
	isLoading,
	useSectionHeader = true,
	rowClassName,
	showGridLines = false,
	stickyHeaderMode = false,
	compact = false,
	mobileCompact = false,
	enableSorting = false,
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([]);

	const searchParams = useSearchParams();
	const sticeyHeaderFinal = searchParams.get("pdf") ? false : stickyHeaderMode;

	const tTravelPay = useTypedTranslations(NAMESPACE.TRAVEL_PAY);

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		onColumnFiltersChange: setColumnFilters,
		...(enableSorting ? { onSortingChange: setSorting } : {}),
		state: { columnFilters, ...(enableSorting ? { sorting } : {}) },
	});

	const allColumns = table.getAllColumns();
	const totalColumns = allColumns.length;

	const getColWidth = (i: number): number => {
		const col = allColumns[i];
		if (!col) return 160;
		const hasCustomSize = col.getSize() !== TANSTACK_DEFAULT_SIZE;
		if (hasCustomSize) return col.getSize();
		return i === 0 || i === totalColumns - 1 ? 150 : 160;
	};

	const ColGroup = () => (
		<colgroup>
			{allColumns.map((col, i) => (
				<col key={col.id} style={{ width: `${getColWidth(i)}px` }} />
			))}
		</colgroup>
	);

	// Total min-width is the sum of all column widths — computed from actual columns,
	// not a hardcoded number. Both tables get the same value so they scroll together.
	const minTableWidth = allColumns.reduce((sum, _, i) => sum + getColWidth(i), 0);

	// Only render the header row when it actually has content to show.
	// When useSectionHeader=false, no title, no search, no filter, and no action
	// buttons, the header div is entirely empty — hiding it avoids the orphan mb-6 gap.
	const hasHeader = useSectionHeader || !!title || !!handleSearch || !!filterComponent || !!actionButtons?.length;

	return (
		<div className={`datatable-root w-full min-w-[full] overflow-x-auto rounded-md max-lg:p-0 ${className}`}>
			{hasHeader && (
				<div className="datatable-header mb-6 flex w-full items-center justify-between gap-4 overflow-visible">
					{useSectionHeader ? (
						<div className="relative z-50 flex items-center gap-2">
							<SectionHeader title={title as string} />
						</div>
					) : title ? (
						<div className="flex items-center gap-2">
							<h1
								className={cn(
									"font-bold text-brand-dark",
									"text-[21px] leading-[28px]",
									"2xl:text-[30px] 2xl:leading-[38px]",
									"[@media(min-width:1920px)]:text-[52px] [@media(min-width:1920px)]:leading-[62px]"
								)}
							>
								{title}
							</h1>
						</div>
					) : null}

					<div className="flex items-center gap-2">
						{handleSearch && (
							<div className="search-bar py-1">
								<Input
									className={cn("h-10 bg-white", searchInputClassName)}
									icon={<Search className="h-4 w-4 text-muted-foreground" />}
									iconPosition="left"
									placeholder={searchPlaceholder}
									onChange={(e) => handleSearch(e.target.value)}
									value={searchValue}
								/>
							</div>
						)}

						{filterComponent && filterComponent}

						{actionButtons?.map((button) => button)}
					</div>
				</div>
			)}

			{sticeyHeaderFinal ? (
				<div className="datatable-table-container overflow-hidden rounded-3xl border bg-white">
					{/* Single scroll container — thead is CSS-sticky so no separate header table
					    is needed, eliminating the hardcoded scrollbar-width padding that caused
					    the right-side gap when content didn't overflow. */}
					<div
						className="datatable-scroll-container"
						style={{
							maxHeight: "calc(100vh - 100px)",
							overflowY: "auto",
							overflowX: "auto",
						}}
					>
						<table
							style={{
								tableLayout: "fixed",
								minWidth: `${minTableWidth}px`,
								width: compact ? `${minTableWidth}px` : "100%",
							}}
						>
							<ColGroup />
							<thead>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header, index) => (
											<th
												key={header.id}
												className={cn(
													compact
														? "sticky top-0 z-10 h-[35px] border-b border-b-gray-200 bg-brand-bgLightgrey px-2 py-0.5 text-xs font-semibold text-brand-dark50"
														: "sticky top-0 z-10 h-[70px] bg-brand-bgLightgrey px-4 text-sm font-semibold text-brand-dark50",
													mobileCompact &&
														"max-[767px]:h-[30px] max-[767px]:border-b max-[767px]:border-b-gray-200 max-[767px]:px-2 max-[767px]:py-1 max-[767px]:text-xs max-[767px]:leading-tight",
													index === 0 ? "text-left" : "text-center",
													showGridLines && "border border-r last:border-r-0"
												)}
											>
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody>
								{isLoading ? (
									<tr>
										<td colSpan={columns.length} className="text-center">
											<div className="flex items-center justify-center gap-2 text-foreground/60">
												<Spinner />
											</div>
										</td>
									</tr>
								) : table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<tr
											key={row.id}
											className={cn(
												"border border-b",
												onClick ? "cursor-pointer" : "cursor-default",
												rowClassName ? rowClassName(row.original) : "hover:bg-gray-50"
											)}
											onClick={() => onClick?.(row.original)}
										>
											{row.getVisibleCells().map((cell, index) => (
												<td
													key={cell.id}
													className={cn(
														"relative",
														compact
															? "px-2 py-1 text-xs font-medium text-brand-dark"
															: "px-4 py-4 text-sm font-medium text-brand-dark",
														mobileCompact && "max-[767px]:px-2 max-[767px]:py-1 max-[767px]:text-xs",
														index === 0 ? "text-left" : "text-center",
														showGridLines && "border border-r last:border-r-0"
													)}
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</td>
											))}
										</tr>
									))
								) : (
									<tr>
										<td colSpan={columns.length} className="h-20 self-center text-center text-base text-foreground/60">
											{tTravelPay.noResults}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			) : (
				<div className={cn("datatable-table-container overflow-x-auto rounded-3xl border bg-white")}>
					<Table
						className={cn(showGridLines && "border-collapse")}
						style={{ minWidth: `${minTableWidth}px`, width: "100%" }}
					>
						<TableHeader
							className={cn(
								compact
									? "sticky top-0 z-10 h-[20px] bg-brand-bgLightgrey [&_tr]:border"
									: "sticky top-0 z-10 h-[70px] bg-brand-bgLightgrey [&_tr]:border",
								showGridLines && "[&_tr]:border [&_tr]:border-b"
							)}
						>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id} className="hover:bg-transparent">
									{headerGroup.headers.map((header, index) => (
										<TableHead
											key={header.id}
											className={cn("w-auto", showGridLines && "border border-r last:border-r-0")}
										>
											<div
												className={cn(
													"flex w-full min-w-max items-center gap-1 px-2 text-sm font-semibold text-brand-dark50",
													index === 0 ? "justify-start text-left" : "justify-center text-center"
												)}
											>
												{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
											</div>
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className={cn("[&_tr]:border", showGridLines && "[&_tr]:border [&_tr]:border-b")}>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-20 text-center">
										<div className="flex items-center justify-center gap-2 text-foreground/60">
											<Spinner />
										</div>
									</TableCell>
								</TableRow>
							) : table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										className={cn(
											compact ? "h-6" : "h-10",
											onClick ? "cursor-pointer" : "cursor-default",
											rowClassName ? rowClassName(row.original) : "hover:bg-gray-50"
										)}
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										onClick={() => onClick?.(row.original)}
									>
										{row.getVisibleCells().map((cell, index) => (
											<TableCell
												key={cell.id}
												className={cn(
													"relative",
													compact
														? "px-2 py-0.5 text-xs font-medium text-brand-dark"
														: "px-4 text-sm font-medium text-brand-dark",
													index === 0 ? (compact ? "pl-2 text-left" : "pl-4 text-left") : "text-center",
													cell.column.columnDef.id === "action" && "w-auto",
													showGridLines && "border border-r last:border-r-0"
												)}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-20 text-center text-base text-foreground/60">
										{tTravelPay.noResults}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			)}

			{paginatorOptions && data.length > 0 && <DataTablePagination {...paginatorOptions} />}
		</div>
	);
}
