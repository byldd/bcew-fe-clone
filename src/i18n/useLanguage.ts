"use client";

import { useRouter } from "next/navigation";
import { COOKIES } from "@/types";
import Cookies from "js-cookie";
import { LANGUAGES } from "./type";

export function useLanguage() {
	const router = useRouter();

	const changeLanguage = (newLang: LANGUAGES) => {
		Cookies.set(COOKIES.NEXT_LOCALE, newLang);
		router.refresh();
	};

	const getLanguage = () => {
		const cookieLang = Cookies.get(COOKIES.NEXT_LOCALE);
		if (cookieLang && Object.values(LANGUAGES).includes(cookieLang as LANGUAGES)) {
			return cookieLang as LANGUAGES;
		}
		return LANGUAGES.ENGLISH;
	};

	return { changeLanguage, getLanguage };
}
