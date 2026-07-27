import React from "react";

const FormError = ({ error }: { error?: string }) => {
	if (!error) {
		return null;
	}
	return <p className="text-xs font-medium text-red-500">{error}</p>;
};

export default FormError;
