import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AcceptETRModal from "../../time-logs-management/components/accept-etr-modal";
import { FaRegEdit } from "react-icons/fa";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const AcceptETRAction = ({ extendedTimeId }: { extendedTimeId: string }) => {
	const [open, setOpen] = useState(false);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	return (
		<>
			<FaRegEdit onClick={() => setOpen(true)} size={20} />

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader className="text-left">
						<DialogTitle className="text-left">{tTimeLogs.extendedTimeRequest}</DialogTitle>
					</DialogHeader>

					<AcceptETRModal extendedTimeId={extendedTimeId} onClose={() => setOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AcceptETRAction;
