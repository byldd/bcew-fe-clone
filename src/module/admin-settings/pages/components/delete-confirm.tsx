import React from "react";
import { IPageNode } from "../utils/page-tree";
import { Button } from "@/components/ui/button";
import { useDeletePage } from "../hooks/pages";
import { openErrorToast, openSuccessToast } from "@/components/toast";

const DeleteConfirm = ({ page, onClose }: { page: IPageNode; onClose: () => void }) => {
	const { mutate: deletePage, isPending } = useDeletePage();

	const onDelete = () => {
		deletePage(page.id, {
			onSuccess: () => {
				onClose();
				openSuccessToast(`Page ${page.name} deleted  successfully`);
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	return (
		<div>
			<p>
				Are you sure you want to delete this page <span className="font-bold">{page.name}</span> ?
			</p>

			{page.children.length > 0 && <p>This page has children, they will also be deleted.</p>}

			<div className="flex justify-between gap-2 py-4">
				<Button className="flex-1" disabled={isPending} variant="outline" onClick={onClose}>
					Cancel
				</Button>

				<Button className="flex-1" disabled={isPending} variant="filled" onClick={onDelete}>
					Delete
				</Button>
			</div>
		</div>
	);
};

export default DeleteConfirm;
