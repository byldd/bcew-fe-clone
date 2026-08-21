import { DataTable } from "@/components/shared/datatable/datatable";
import { attendancePendingApprovalColumns } from "../utils/attendance-pending-approval-columns";
import { IAttendancePendingApproval } from "../types";

const AttendancePendingApprovalTable = ({
	data,
	isLoading,
}: {
	data: IAttendancePendingApproval[];
	isLoading: boolean;
}) => (
	<DataTable
		title="Pending Approval"
		columns={attendancePendingApprovalColumns}
		data={data}
		isLoading={isLoading}
		showGridLines
		stickyHeaderMode
		compact
	/>
);

export default AttendancePendingApprovalTable;
