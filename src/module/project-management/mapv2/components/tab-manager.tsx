"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useModal } from "@/hooks/useModal";
import ConfirmModal from "@/components/confirm-modal";
import { useDeleteMapZoneTab, useGetAccessibleMapZoneTabs } from "../hooks/useMapZoneTabs";
import { IMapZoneTab } from "../types/zone";
import TabFormModal from "./tab-form-modal";

const TabManager = () => {
	const queryClient = useQueryClient();
	const { data: tabs, isLoading } = useGetAccessibleMapZoneTabs();
	const { mutate: deleteTab } = useDeleteMapZoneTab();
	const { Modal, openModal, closeModal } = useModal();
	const { Modal: ConfirmDeleteModal, openModal: openConfirmModal, closeModal: closeConfirmModal } = useModal();

	const invalidate = () => {
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs"] });
		void queryClient.invalidateQueries({ queryKey: ["map-zone-tabs-accessible"] });
	};

	const handleCreate = () => {
		openModal({ modalTitle: "Create Tab", modalView: <TabFormModal onClose={closeModal} />, variant: "medium" });
	};

	const handleEdit = (tab: IMapZoneTab) => {
		openModal({
			modalTitle: "Edit Tab",
			modalView: <TabFormModal tab={tab} onClose={closeModal} />,
			variant: "medium",
		});
	};

	const handleDelete = (tab: IMapZoneTab) => {
		openConfirmModal({
			modalTitle: "Delete Tab",
			modalView: (
				<ConfirmModal
					description={`Delete tab "${tab.name}"? It must have no zone types left.`}
					confirmText="Delete"
					onCancel={closeConfirmModal}
					onConfirm={() => {
						closeConfirmModal();
						deleteTab(tab.id, {
							onSuccess: () => {
								openSuccessToast("Tab deleted successfully.");
								invalidate();
							},
							onError: (error) => openErrorToast({ error }),
						});
					}}
				/>
			),
			variant: "medium",
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
					Create Tab
				</Button>
			</div>

			<div className="flex flex-col gap-2">
				{(tabs ?? []).map((tab) => (
					<div
						key={tab.id}
						className="flex items-center justify-between gap-2 rounded-lg border border-brand-dark10 p-2"
					>
						<div>
							<p className="text-sm font-medium text-brand-dark">{tab.name}</p>
							<p className="text-xs text-brand-grey">{tab.mapZoneTypes.length} zone type(s)</p>
						</div>
						<div className="flex items-center gap-2">
							<button type="button" onClick={() => handleEdit(tab)} aria-label="Edit tab">
								<Pencil size={14} />
							</button>
							<button type="button" onClick={() => handleDelete(tab)} aria-label="Delete tab">
								<Trash2 size={14} />
							</button>
						</div>
					</div>
				))}
			</div>

			<Modal />
			<ConfirmDeleteModal />
		</div>
	);
};

export default TabManager;
