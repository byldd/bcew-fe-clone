import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IFingerprintApproval } from "../utils/types";
import FingerprintApprovalModal from "./fingerprint-approval-modal";
import { FaRegEdit } from "react-icons/fa";

const FingerprintApprovalAction = ({ row }: { row: IFingerprintApproval }) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<FaRegEdit onClick={() => setOpen(true)} size={20} className="cursor-pointer" />

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader className="text-left">
						<DialogTitle className="text-left">Fingerprint Approval</DialogTitle>
					</DialogHeader>

					<FingerprintApprovalModal row={row} onClose={() => setOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
};

export default FingerprintApprovalAction;
