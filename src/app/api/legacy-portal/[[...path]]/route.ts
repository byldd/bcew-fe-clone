import { NextRequest, NextResponse } from "next/server";

const LEGACY_ORIGIN = "https://bcewonline.com:444";
const LEGACY_BASE_PATH = "/Portal";
const PROXY_BASE_PATH = "/api/legacy-portal";

const SKIP_HEADERS = new Set([
	"transfer-encoding",
	"connection",
	"keep-alive",
	"set-cookie",
	"x-frame-options",
	// We decode the body ourselves via fetch, so content-encoding must not be forwarded
	"content-encoding",
	"content-length", // length changes after decoding/rewriting
]);

function rewriteLocationHeader(location: string): string {
	const absolute = LEGACY_ORIGIN + LEGACY_BASE_PATH;
	if (location.startsWith(absolute)) {
		return PROXY_BASE_PATH + location.slice(absolute.length);
	}
	if (location.startsWith(LEGACY_BASE_PATH + "/") || location === LEGACY_BASE_PATH) {
		return PROXY_BASE_PATH + location.slice(LEGACY_BASE_PATH.length);
	}
	return location;
}

function rewriteSetCookieHeader(cookie: string): string {
	return cookie.replace(/;\s*Domain=[^;,]*/gi, "").replace(/;\s*Path=\/Portal\b/gi, "; Path=/");
}

function rewriteHtml(html: string): string {
	const escapedOriginBase = (LEGACY_ORIGIN + LEGACY_BASE_PATH).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const escapedBase = LEGACY_BASE_PATH.replace(/\//g, "\\/");

	return html
		.replace(new RegExp(escapedOriginBase, "g"), PROXY_BASE_PATH)
		.replace(new RegExp(`((?:action|href|src|formaction)=["'])${escapedBase}(?=\\/|")`, "gi"), `$1${PROXY_BASE_PATH}`);
}

async function handleProxy(req: NextRequest, path: string[] | undefined): Promise<NextResponse> {
	const targetPath = path?.join("/") ?? "";
	const targetUrl = new URL(`${LEGACY_ORIGIN}${LEGACY_BASE_PATH}/${targetPath}`);

	req.nextUrl.searchParams.forEach((value, key) => {
		targetUrl.searchParams.set(key, value);
	});

	const forwardHeaders = new Headers();
	const cookie = req.headers.get("cookie");
	if (cookie) forwardHeaders.set("cookie", cookie);
	const contentType = req.headers.get("content-type");
	if (contentType) forwardHeaders.set("content-type", contentType);
	const userAgent = req.headers.get("user-agent");
	if (userAgent) forwardHeaders.set("user-agent", userAgent);
	forwardHeaders.set("host", "bcewonline.com:444");
	// Request uncompressed so the binary passthrough path is also safe
	forwardHeaders.set("accept-encoding", "identity");

	const body = !["GET", "HEAD"].includes(req.method) ? await req.arrayBuffer() : undefined;

	let upstream: Response;
	try {
		upstream = await fetch(targetUrl.toString(), {
			method: req.method,
			headers: forwardHeaders,
			body: body as BodyInit | undefined,
			redirect: "manual",
		});
	} catch {
		return new NextResponse("Unable to reach legacy portal", { status: 502 });
	}

	const responseHeaders = new Headers();
	responseHeaders.set("X-Frame-Options", "SAMEORIGIN");

	upstream.headers.forEach((value, key) => {
		const lower = key.toLowerCase();
		if (SKIP_HEADERS.has(lower)) return;
		if (lower === "location") {
			responseHeaders.set("location", rewriteLocationHeader(value));
			return;
		}
		responseHeaders.set(key, value);
	});

	const setCookies = upstream.headers.getSetCookie?.() ?? [];
	for (const c of setCookies) {
		responseHeaders.append("set-cookie", rewriteSetCookieHeader(c));
	}

	const upstreamContentType = upstream.headers.get("content-type") ?? "";
	if (upstreamContentType.includes("text/html")) {
		const text = await upstream.text();
		return new NextResponse(rewriteHtml(text), {
			status: upstream.status,
			headers: responseHeaders,
		});
	}

	return new NextResponse(upstream.body, {
		status: upstream.status,
		headers: responseHeaders,
	});
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
	return handleProxy(req, (await params).path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
	return handleProxy(req, (await params).path);
}
