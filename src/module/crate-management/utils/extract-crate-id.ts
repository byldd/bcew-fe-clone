// QR label URL format (BCEW legacy portal), param casing varies by page:
// https://bcewonline.com:444/.../AssetInfo.aspx?AssetId=9495
// https://bcewonline.com:444/.../AssetLabel.aspx?assetid=8143
export function extractCrateId(raw: string): string | null {
	try {
		const url = new URL(raw);
		for (const [key, value] of url.searchParams) {
			if (key.toLowerCase() === "assetid") return value;
		}
		return null;
	} catch {
		return null;
	}
}
