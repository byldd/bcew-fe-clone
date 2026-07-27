"use client";

import { Button } from "@/components/ui/button";
import VehicleHistoryTable from "@/module/employee-dashboard/components/vehicle-history-table";
import { ChangeVehicleModalContent } from "@/module/employee-dashboard/components/change-vehicle-modal-content ";
import { useModal } from "@/hooks/useModal";
import { useEmployeeVehicles, useUpdateEmployeeVehicle } from "@/module/job/hooks/useEmployeeSchedule";
import DataTableSkeleton from "@/components/data-table-skeleton";
import { openErrorToast } from "@/components/toast";
import { dateToUTCString } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import BackButton from "@/components/common/back-button";

export default function VehicleHistoryTemplate() {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const { Modal, openModal, closeModal } = useModal();
	const { data, refetch, isPending, isError, error } = useEmployeeVehicles();
	const { mutate: updateVehicle } = useUpdateEmployeeVehicle();

	const handleRefetch = () => {
		refetch();
		closeModal();
	};

	const handleOpenFormModal = () => {
		openModal({
			modalTitle: tEmployee.changeVehicle,
			modalView: (
				<ChangeVehicleModalContent
					previousVehicleNumber={data && data[0]?.Truck_Number}
					onSuccess={handleUpdate}
					onCancel={closeModal}
				/>
			),
			subHeader: <span>{tEmployee.updatingVehicleDuringShift}</span>,
			variant: "default",
		});
	};

	const handleUpdate = (licenseNumber: string, notes: string) => {
		closeModal();

		updateVehicle(
			{
				licenseNumber,
				notes,
				assignTime: dateToUTCString(new Date()),
			},
			{
				onSuccess: () => {
					openModal({
						modalTitle: tEmployee.vehicleChangeSuccessfully,
						modalView: (
							<Button variant={"outline"} className="w-full" onClick={handleRefetch}>
								{tEmployee.okay}
							</Button>
						),
					});
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	if (isPending) return <DataTableSkeleton columnsCount={5} rowsCount={10} />;
	if (isError) return <div className="p-4 text-lg text-red-500">{error?.message || tschedule.somethingWentWrong}</div>;

	return (
		<div className="flex h-screen flex-col">
			<div className="flex h-full w-full flex-col bg-white">
				<div className="shrink-0 space-y-2 px-4 py-3">
					<div className="flex items-center gap-2">
						<BackButton />
						<h1 className="text-xl font-semibold text-brand-dark">{tEmployee.vehicleAssignmentHistory}</h1>
					</div>
					<p className="ml-10 text-sm text-brand-dark50">{data && data[0]?.Truck_Number}</p>
				</div>

				<div className="flex-1 overflow-y-auto px-6">
					<VehicleHistoryTable data={data} />
				</div>

				<div className="shrink-0 p-4">
					<Button onClick={handleOpenFormModal} variant={"filled"} className="w-full">
						{tEmployee.changeVehicle}
					</Button>
				</div>
			</div>

			<Modal />
		</div>
	);
}
