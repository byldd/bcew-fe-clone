import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface SkeletonProps {
	columnsCount?: number;
	rowsCount?: number;
}

export default function DataTableSkeleton({ columnsCount = 7, rowsCount = 10 }: SkeletonProps) {
	return (
		<div className="rounded-md border p-3">
			<div className="mb-4 h-6 w-1/4">
				<Skeleton className="h-full w-full" />
			</div>
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							{Array.from({ length: columnsCount }).map((_, i) => (
								<TableHead key={i}>
									<Skeleton className="mx-auto h-4 w-24" />
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: rowsCount }).map((_, rowIdx) => (
							<TableRow key={rowIdx}>
								{Array.from({ length: columnsCount }).map((_, colIdx) => (
									<TableCell key={colIdx}>
										<Skeleton className="mx-auto h-4 w-full max-w-[120px]" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
