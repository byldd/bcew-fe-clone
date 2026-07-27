"use client";
import SectionHeader from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { Plus } from "lucide-react";
import React, { useMemo } from "react";
import PageForm from "../components/page-form";
import PageTreeItem from "../components/page-tree-item";
import { useGetAppPages } from "../hooks/pages";
import { buildPageTree, IPageNode } from "../utils/page-tree";

const PagesSetting = () => {
	const { data: pages, isLoading } = useGetAppPages();
	const { Modal, openModal, closeModal } = useModal();

	const tree = useMemo(() => buildPageTree(pages ?? []), [pages]);

	const openAddModal = (parentPageId?: string) => {
		openModal({
			modalTitle: parentPageId ? "Add Child Page" : "Add Page",
			modalView: <PageForm onClose={closeModal} parentPageId={parentPageId} />,
			variant: "default",
		});
	};

	const openEditModal = (page: IPageNode) => {
		openModal({
			modalTitle: "Edit Page",
			modalView: <PageForm onClose={closeModal} editPage={page} />,
			variant: "default",
		});
	};

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<div className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<SectionHeader title={"Page Management"} />
					<Button
						variant="filled"
						size="sm"
						onClick={() => openAddModal()}
						className="flex items-center gap-1.5 self-start"
					>
						<Plus size={14} />
						Add Page
					</Button>
				</div>
			</div>

			<div className="mt-6 flex flex-col gap-1 overflow-y-auto">
				{isLoading && (
					<div className="flex flex-col gap-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="h-14 animate-pulse rounded-xl bg-[#1515150D]" />
						))}
					</div>
				)}

				{!isLoading && tree.length === 0 && (
					<div className="flex flex-col items-center justify-center gap-3 py-16">
						<p className="text-sm text-[#15151580]">No pages yet.</p>
						<Button variant="outline" size="sm" onClick={() => openAddModal()} className="flex items-center gap-1.5">
							<Plus size={14} />
							Add your first page
						</Button>
					</div>
				)}

				{tree.map((node) => (
					<PageTreeItem
						key={node.id}
						node={node}
						onAddChild={(parentPageId) => openAddModal(parentPageId)}
						onEdit={(page: IPageNode) => openEditModal(page)}
					/>
				))}
			</div>

			<Modal />
		</div>
	);
};

export default PagesSetting;
