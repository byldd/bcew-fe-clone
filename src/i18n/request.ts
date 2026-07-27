import { cookies } from "next/headers";
import { COOKIES } from "@/types";
import { LANGUAGES, Messages } from "./type";

export type MessagesType = Record<string, unknown>;

export default async function getRequestConfig(): Promise<{
	locale: string;
	messages: MessagesType;
}> {
	const cookieStore = await cookies();
	const locale = cookieStore.get(COOKIES.NEXT_LOCALE)?.value || LANGUAGES.ENGLISH;

	const messages: Record<keyof Messages, unknown> = {
		common: (await import(`../locales/${locale}/common.json`)).default,
		schedule: (await import(`../locales/${locale}/schedule.json`)).default,
		jobCards: (await import(`../locales/${locale}/job-cards.json`)).default,
		employeeRoster: (await import(`../locales/${locale}/employee-roster.json`)).default,
		timeLogs: (await import(`../locales/${locale}/time-logs.json`)).default,
		travelPay: (await import(`../locales/${locale}/travel-pay.json`)).default,
		peopleManagement: (await import(`../locales/${locale}/people-management.json`)).default,
		employee: (await import(`../locales/${locale}/employee.json`)).default,
		admin: (await import(`../locales/${locale}/admin.json`)).default,
		subcontractor: (await import(`../locales/${locale}/subcontractor.json`)).default,
		builderCommunication: (await import(`../locales/${locale}/builder-communication.json`)).default,
		releaseNote: (await import(`../locales/${locale}/release-note.json`)).default,
	};

	return {
		locale,
		messages,
	};
}
