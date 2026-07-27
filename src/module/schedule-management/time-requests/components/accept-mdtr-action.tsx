import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IMiddayStopRequest } from "../utils/types";
import AcceptMDTRModal from "./accept-mdtr-modal";
import { FaRegEdit } from "react-icons/fa";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const AccpetMDTRAction = ({ row }: { row: IMiddayStopRequest }) => {
	const [open, setOpen] = useState(false);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	return (
		<>
			<FaRegEdit onClick={() => setOpen(true)} size={20} />

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader className="text-left">
						<DialogTitle className="text-left">{tTimeLogs.newJobRequest}</DialogTitle>
					</DialogHeader>

					<AcceptMDTRModal middayStopId={row.id} onClose={() => setOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AccpetMDTRAction;
