import { useTranslations } from "next-intl";
import type { Messages } from "./type";
import { NAMESPACE } from "./type";

export function useTypedTranslations<N extends (typeof NAMESPACE)[keyof typeof NAMESPACE]>(namespace: N) {
	const t = useTranslations(namespace);

	return new Proxy({} as Messages[N], {
		get(_, key: string) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return t(key);
		},
	});
}
