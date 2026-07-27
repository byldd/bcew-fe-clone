"use client";

import { DataTable } from "@/components/shared/datatable/datatable";
import { IGetMapZone } from "../types/zone";
import { getProjectZoneColumns } from "../utils/project-zone-columns";

interface ProjectZoneTableProps {
	zones: IGetMapZone[];
	isLoading?: boolean;
	onEdit: (zone: IGetMapZone) => void;
	onDelete: (zone: IGetMapZone) => void;
}

const ProjectZoneTable = ({ zones, isLoading, onEdit, onDelete }: ProjectZoneTableProps) => {
	const columns = getProjectZoneColumns({ onEdit, onDelete });

	return <DataTable columns={columns} data={zones} isLoading={isLoading} useSectionHeader={false} showGridLines />;
};

export default ProjectZoneTable;
