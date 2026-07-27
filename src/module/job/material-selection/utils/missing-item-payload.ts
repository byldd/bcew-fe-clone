import { MissingItemFormValues } from "../hooks/missing-item-form";
import { MissingItemRequestPayloadBase } from "./types";

export function buildMissingItemRequestFields(
	data: MissingItemFormValues,
	publicUrlByKeyFile: Map<string, string>
): MissingItemRequestPayloadBase {
	const images = (data.images ?? []).map((image) => ({
		keyFile: image.keyFile,
		url: publicUrlByKeyFile.get(image.keyFile) ?? image.url,
	}));

	return {
		description: data.description.trim(),
		quantity: data.quantity,
		images,
	};
}
