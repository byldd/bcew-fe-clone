import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIES, ROLES } from "@/types";
import { routes } from "@/config/routes";
import { LOGIN_MODE } from "@/utils/enums";
import { AUTH_QUERY_PARAM } from "@/module/auth/utils/constants";

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;
	const intendedPath = `${path}${request.nextUrl.search}`;

	const publicPaths = [routes.signIn, routes.root, routes.matchFingerprint];

	const isPublicPath = publicPaths.includes(path);

	const token = request.cookies.get(COOKIES.AUTH_TOKEN)?.value || "";
	const userType = request.cookies.get(COOKIES.USER_TYPE)?.value || "";

	const redirectToDashboard = () => {
		if (token) {
			switch (userType) {
				case ROLES.ADMIN:
					return NextResponse.redirect(new URL(routes.admin.dashboard, request.url));
				case ROLES.TECHNICIAN_EMPLOYEE:
					return NextResponse.redirect(new URL(routes.employee.dashboard, request.url));
				case ROLES.SUB_CONTRACTOR:
					return NextResponse.redirect(new URL(routes.subContractor.adminDashboard, request.url));
				case ROLES.SUB_CONTRACTOR_CREW_LEADER:
					return NextResponse.redirect(new URL(routes.subContractor.crewLeaderDashboard, request.url));
				default:
					return NextResponse.redirect(new URL(routes.signIn, request.url));
			}
		}

		return NextResponse.redirect(new URL(routes.signIn, request.url));
	};

	// Case 1: Logged-in users accessing public pages → redirect to their dashboard
	if (token && userType && isPublicPath && path !== routes.matchFingerprint) {
		return redirectToDashboard();
	}

	// Case 2: Logged-out users accessing protected pages or root path → redirect to relevant sign-in page
	if ((!token || !userType) && (path === "/" || !isPublicPath)) {
		if (path === routes.employee.reportVehicleIssue) {
			const url = new URL(routes.signIn, request.url);
			url.searchParams.set(AUTH_QUERY_PARAM.REDIRECT, intendedPath);
			return NextResponse.redirect(url);
		}

		// Sub-contractor crew leader
		if (path.startsWith(routes.subContractor.crewLeaderRoot)) {
			const url = new URL(routes.signIn, request.url);
			url.searchParams.set(AUTH_QUERY_PARAM.LOGIN, LOGIN_MODE.SUB_CONTRACTOR_CREW_LEADER);
			return NextResponse.redirect(url);
		}

		return NextResponse.redirect(new URL(routes.signIn, request.url));
	}

	// Allow request if no redirection conditions are met
	return NextResponse.next();
}

// Exclude static assets and API routes from middleware
export const config = {
	matcher: [
		"/signin/:path*",
		"/signup",
		"/",
		"/match-finger",
		"/admin/:path*",
		"/employee/:path*",
		"/sub-contractor/:path*",
		"/sub-contractor/crew-leader/:path*",
	],
};
