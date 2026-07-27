import { type AxiosError } from "axios";
import React, { ReactNode } from "react";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";

const clearPreviousToast = () => {
	toast.dismiss("errorId");
	toast.dismiss("successId");
};

const openErrorToast = ({
	error,
	message,
}: {
	error?: Error | AxiosError<{ message: string }>;
	message?: string | ReactNode;
}) => {
	clearPreviousToast();

	let errorMessage: string | ReactNode = "";
	const axiosError = error as AxiosError<{ message: string }>;

	if (axiosError?.response && axiosError?.response?.data && axiosError?.response?.data?.message) {
		errorMessage = axiosError.response.data.message;
	} else {
		errorMessage = message ?? "An unexpected error occurred.";
	}

	const onCloseToast = (id: string) => {
		toast.dismiss(id);
	};

	toast.error(<ErrorToast message={errorMessage} onCloseToast={onCloseToast} id="errorId" />, {
		duration: 4000,
		id: "errorId",
	});
};

const openSuccessToast = (message?: string | React.ReactNode) => {
	clearPreviousToast();

	const onCloseToast = (id: string) => {
		toast.dismiss(id);
	};

	toast.success(<SuccessToast message={message ?? "Success"} onCloseToast={onCloseToast} id="successId" />, {
		duration: 4000,
		id: "successId",
	});
};

export { openErrorToast, openSuccessToast };

const SuccessToast = ({
	message,
	onCloseToast,
	id,
}: {
	message: string | ReactNode;
	onCloseToast: (id: string) => void;
	id: string;
}) => {
	return (
		<div className="flex items-start justify-between gap-3 text-black">
			{typeof message === "string" ? <p>{message}</p> : message}
			<RxCross2 className="mt-0.5 cursor-pointer" onClick={() => onCloseToast(id)} />
		</div>
	);
};

const ErrorToast = ({
	message,
	onCloseToast,
	id,
}: {
	message: string | ReactNode;
	onCloseToast: (id: string) => void;
	id: string;
}) => {
	return (
		<div className="flex items-start justify-between gap-2">
			<RxCross2
				className="absolute right-[5px] top-[13px]"
				onClick={() => {
					onCloseToast(id);
				}}
			/>
			<p className="pr-3 text-black">{typeof message === "string" ? <span>{message}</span> : message}</p>
		</div>
	);
};
