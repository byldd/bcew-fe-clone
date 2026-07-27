"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AppTooltip } from "@/components/ui/tooltip";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useModal } from "@/hooks/useModal";
import ConfirmModal from "@/components/confirm-modal";
import { useGetAccessibleMapZoneTabs } from "../hooks/useMapZoneTabs";
import { useDeleteMapZoneType } from "../hooks/useMapZoneTypes";
import { IMapZoneType } from "../types/zone";
import { MAP_ZONE_TYPE } from "../utils/enums";
import ZoneTypeFormModal from "./zone-type-form-modal";

const isSystemTypeId = (id: string) => id === MAP_ZONE_TYPE.EMPLOYEE || id === MAP_ZONE_TYPE.PROJECT;

const ZoneTypeManager = () => {
	const queryClient = useQueryClient();
	const { data: tabs, isLoading } = useGetAccessibleMapZoneTabs();
	const { mutate: deleteType } = useDeleteMapZoneType();
	const { Modal, openModal, closeModal } = useModal();
	const { Modal: ConfirmDeleteModal, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();

	const rows = useMemo(
		() => (tabs ?? []).flatMap((tab) => tab.mapZoneTypes.map((type) => ({ type, tabName: tab.name }))),
		[tabs]
	);

	const invalidate = () => {
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs-accessible"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zone-types"] });
	};

	const handleCreate = () => {
		openModal({
			modalTitle: "Create Zone Type",
			modalView: <ZoneTypeFormModal onClose={closeModal} />,
			variant: "medium",
		});
	};

	const handleEdit = (type: IMapZoneType) => {
		openModal({
			modalTitle: "Edit Zone Type",
			modalView: <ZoneTypeFormModal type={type} onClose={closeModal} />,
			variant: "medium",
		});
	};

	const handleDelete = (type: IMapZoneType) => {
		openConfirmModal({
			modalTitle: "Delete Zone Type",
			modalView: (
				<ConfirmModal
					description={`Delete zone type "${type.name}"? It must have no zones left.`}
					confirmText="Delete"
					onCancel={closeConfirmModal}
					onConfirm={() => {
						closeConfirmModal();
						deleteType(type.id, {
							onSuccess: () => {
								openSuccessToast("Zone type deleted successfully.");
								invalidate();
							},
							onError: (error) => openErrorToast({ error }),
						});
					}}
				/>
			),
		});
	};

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-end">
				<Button type="button" variant="filled" onClick={handleCreate} className="self-start">
					<Plus size={14} className="mr-1" />
					Create Zone Type
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				{rows.map(({ type, tabName }) => {
					const isSystemType = isSystemTypeId(type.id);
					const deleteDisabled = isSystemType || type._count.mapZones > 0;
					const deleteDisabledReason = isSystemType
						? "System zone types can't be deleted."
						: type._count.mapZones > 0
							? "This type still has zones - delete or move them first."
							: undefined;

					return (
						<div
							key={type.id}
							className="flex items-center justify-between gap-2 rounded-lg border border-brand-dark10 p-2"
						>
							<div className="flex items-center gap-2">
								<span
									className="h-3 w-3 flex-shrink-0 rounded-full border border-brand-dark10"
									style={{ backgroundColor: type.color ?? "#D1D5DB" }}
								/>
								<div>
									<p className="text-sm font-medium text-brand-dark">{type.name}</p>
									<p className="text-xs text-brand-grey">
										{tabName} · {type._count.mapZones} zone(s)
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button type="button" onClick={() => handleEdit(type)} aria-label="Edit zone type">
									<Pencil size={14} />
								</button>
								{deleteDisabledReason ? (
									<AppTooltip
										trigger={
											<span className="text-brand-grey opacity-40">
												<Trash2 size={14} />
											</span>
										}
										text={deleteDisabledReason}
									/>
								) : (
									<button
										type="button"
										onClick={() => handleDelete(type)}
										disabled={deleteDisabled}
										aria-label="Delete zone type"
									>
										<Trash2 size={14} />
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<Modal />
			<ConfirmDeleteModal />
		</div>
	);
};

export default ZoneTypeManager;
