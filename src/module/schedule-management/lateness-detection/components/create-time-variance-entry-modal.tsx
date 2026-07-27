"use client";

import { useState } from "react";
import { SelectField } from "@/components/ui/selectField";
import { TIME_VARIANCE_TYPE } from "@/utils/enums";
import CreateLateStartForm from "./create-late-start-form";
import CreateEarlyReleaseForm from "./create-early-release-form";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
interface Props {
	closeModal: () => void;
}

const CreateTimeVarianceEntryModal = ({ closeModal }: Props) => {
	const [entryType, setEntryType] = useState<TIME_VARIANCE_TYPE>(TIME_VARIANCE_TYPE.LATE_ARRIVAL);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	return (
		<div className="w-full space-y-6">
			<SelectField
				label={tTimeLogs.selectTypeOfEntry}
				value={entryType}
				onValueChange={(val) => setEntryType(val as TIME_VARIANCE_TYPE)}
				options={[
					{ label: tTimeLogs.lateStart, value: TIME_VARIANCE_TYPE.LATE_ARRIVAL },
					{ label: tTimeLogs.earlyQuit, value: TIME_VARIANCE_TYPE.EARLY_LOGOUT },
				]}
			/>

			{entryType === TIME_VARIANCE_TYPE.LATE_ARRIVAL && <CreateLateStartForm closeModal={closeModal} />}

			{entryType === TIME_VARIANCE_TYPE.EARLY_LOGOUT && <CreateEarlyReleaseForm closeModal={closeModal} />}
		</div>
	);
};

export default CreateTimeVarianceEntryModal;
