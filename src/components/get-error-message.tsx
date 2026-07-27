import { AxiosError } from "axios";

export const getErrorMessage = (
	error?: Error | AxiosError<{ message?: string }>,
	fallbackMessage = "Something went wrong"
): string => {
	const axiosError = error as AxiosError<{ message?: string }>;
	return axiosError?.response?.data?.message || fallbackMessage;
};

export default function ErrorMessageComponent({ error, message }: { error?: Error; message?: string }) {
	return <div className="p-4 text-lg text-red-500">{getErrorMessage(error, message)}</div>;
}
