"use client";
import { COOKIES, ROLES } from "@/types";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";
import { setLoginCookies } from "@/module/auth/utils/helpers";

const SchedulePdf = () => {
	const router = useRouter();
	const params = useSearchParams();
	const paramsUserType = params.get(COOKIES.USER_TYPE) || "";
	const paramsToken = params.get(COOKIES.AUTH_TOKEN) || "";
	const startDate = params.get("startDate") || "";
	const endDate = params.get("endDate") || "";
	const pdfType = params.get("pdfType") || "";
	const goto = params.get("goto") || "";
	const date = params.get("date") || "";

	useEffect(() => {
		setLoginCookies({ token: paramsToken, userType: paramsUserType as ROLES });

		router.replace(
			`${goto || routes.admin.weeklySchedule}?pdf=true${startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : ""}${pdfType ? `&pdfType=${pdfType}` : ""}${date ? `&date=${date}` : ""}`
		);
	}, [paramsUserType, paramsToken, router, pdfType, startDate, endDate, goto, date]);

	return <div></div>;
};

export default SchedulePdf;
