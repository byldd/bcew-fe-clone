"use client";

import { useCallback, useMemo, useState } from "react";
import { Fingerprint } from "lucide-react";
import ErrorMessageComponent from "@/components/get-error-message";
import { DataTable } from "@/components/shared/datatable/datatable";
import { Button } from "@/components/ui/button";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import FingerprintEnrollModal from "../components/fingerprint-enroll-modal";
import { useEnrolledStatus, useWarehouseEmployees } from "../hooks/useEnrollFingerprint";
import { IWarehouseEmployee } from "../types";
import { getWarehouseEmployeeColumns } from "../utils/column";
import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";

export default function EmployeeList() {
	const [search, setSearch] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<
		| (IWarehouseEmployee & {
				fingerprints?: {
					id: string;
				}[];
		  })
		| null
	>(null);

	const { data, isPending, isError, error } = useWarehouseEmployees({
		searchValue: search,
	});

	const { data: enrolledData = [], refetch: refetchEnrolled } = useEnrolledStatus();
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const enrolledMap = useMemo(() => {
		return new Map(enrolledData.map((item) => [item.userId, item]));
	}, [enrolledData]);

	const handleOpenEnrollModal = () => {
		setSelectedEmployee(null);
		setIsModalOpen(true);
	};

	const handleEditFingerprints = useCallback(
		(employee: IWarehouseEmployee) => {
			const enrollment = enrolledMap.get(employee.id);

			setSelectedEmployee({
				...employee,
				fingerprints: enrollment?.fingerprints,
			});

			setIsModalOpen(true);
		},
		[enrolledMap]
	);

	const handleCloseModal = () => {
		setSelectedEmployee(null);
		setIsModalOpen(false);
	};

	const handleEnrollSuccess = () => {
		refetchEnrolled();
		setSelectedEmployee(null);
		setIsModalOpen(false);
	};

	const columns = useMemo(
		() =>
			getWarehouseEmployeeColumns({
				tPeople,
				enrolledMap,
				onEditFingerprints: handleEditFingerprints,
			}),
		[enrolledMap, handleEditFingerprints, tPeople]
	);

	if (isError) {
		return ErrorMessageComponent({ error });
	}

	return (
		<div className="min-h-screen w-full space-y-4 bg-white">
			{/* Header + Controls */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title="Warehouse Fingerprint Enrollment" showBackButton />

				<div className="no-scrollbar overflow-x-auto px-0.5 py-0.5">
					<div className="flex min-w-max items-center gap-2">
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								placeholder="Search employee"
								className="h-9 w-[200px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<Button variant="filled" onClick={handleOpenEnrollModal} className="h-9">
							<Fingerprint className="h-4 w-4" />
							Enroll Fingerprint
						</Button>
					</div>
				</div>
			</div>

			{/* Table */}
			<DataTable
				showGridLines
				columns={columns}
				data={Array.isArray(data?.items) ? data.items : []}
				isLoading={isPending}
				useSectionHeader={false}
			/>

			{isModalOpen && (
				<FingerprintEnrollModal
					employees={Array.isArray(data?.items) ? data.items : []}
					selectedEmployee={selectedEmployee}
					onClose={handleCloseModal}
					onSuccess={handleEnrollSuccess}
				/>
			)}
		</div>
	);
}
