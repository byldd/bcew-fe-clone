"use client";
import { cn } from "@/lib/utils/utils";
import { ChevronRight, Pencil, Plus, Trash } from "lucide-react";
import React, { useState } from "react";
import { IPageNode } from "../utils/page-tree";
import DeleteConfirm from "./delete-confirm";
import { useModal } from "@/hooks/useModal";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

type PageTreeItemProps = {
	node: IPageNode;
	depth?: number;
	onAddChild: (parentPageId: string) => void;
	onEdit: (page: IPageNode) => void;
};

const PageTreeItem = ({ node, depth = 0, onAddChild, onEdit }: PageTreeItemProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const hasChildren = node.children.length > 0;

	const { openModal, closeModal, Modal } = useModal();

	const onDelete = () => {
		openModal({
			modalTitle: "Delete Page",
			modalView: <DeleteConfirm onClose={closeModal} page={node} />,
			variant: "default",
		});
	};

	return (
		<div className="flex flex-col">
			<Modal />
			<div
				className={cn(
					"group flex items-center gap-2 rounded-lg border border-[#1515151A] bg-white px-3 py-2",
					"transition-colors hover:bg-gray-50"
				)}
				style={{ marginLeft: depth * 20 }}
			>
				<button
					type="button"
					onClick={() => setIsExpanded((prev) => !prev)}
					className={cn(
						"flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#15151580] transition-transform",
						hasChildren ? "hover:text-brand-dark" : "cursor-default opacity-0"
					)}
					disabled={!hasChildren}
					tabIndex={hasChildren ? 0 : -1}
				>
					<ChevronRight size={13} className={cn("transition-transform duration-150", isExpanded && "rotate-90")} />
				</button>

				<div className="flex min-w-0 flex-1 items-baseline gap-2">
					<span className="truncate text-sm font-medium text-brand-dark">{node.name}</span>
					{node.urlEndpoint && <span className="truncate text-xs text-[#15151550]">{node.urlEndpoint}</span>}
				</div>

				{hasChildren && <span className="shrink-0 text-xs text-[#15151540]">{node.children.length}</span>}

				<WriteAccessWrapper>
					<div className="ml-1 flex shrink-0 items-center gap-1">
						<button
							type="button"
							onClick={() => onAddChild(node.id)}
							className="flex h-6 w-6 items-center justify-center rounded-lg text-[#15151580] hover:bg-[#1515150D] hover:text-brand-dark"
							title="Add child page"
						>
							<Plus size={13} />
						</button>
						<button
							type="button"
							onClick={() => onEdit(node)}
							className="flex h-6 w-6 items-center justify-center rounded-lg text-[#15151580] hover:bg-[#1515150D] hover:text-brand-dark"
							title="Edit page"
						>
							<Pencil size={13} />
						</button>

						<button
							type="button"
							onClick={() => onDelete()}
							className="flex h-6 w-6 items-center justify-center rounded-lg text-[#15151580] hover:bg-[#1515150D] hover:text-brand-dark"
							title="Delete page"
						>
							<Trash size={13} className="text-red-500" />
						</button>
					</div>
				</WriteAccessWrapper>
			</div>

			{hasChildren && isExpanded && (
				<div className="mt-1 flex flex-col gap-1">
					{node.children.map((child) => (
						<PageTreeItem key={child.id} node={child} depth={depth + 1} onAddChild={onAddChild} onEdit={onEdit} />
					))}
				</div>
			)}
		</div>
	);
};

export default PageTreeItem;
