import SectionHeader from "@/components/shared/section-header";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
	wrap: {
		minHeight: "90vh",
		width: "100%",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		padding: "3rem 1.5rem",
		textAlign: "center",
		position: "relative",
		overflow: "hidden",
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		backgroundColor: "#FFFFFF",
	},
	crane: {
		margin: "0 auto 0.5rem",
		width: "180px",
		height: "180px",
		position: "relative",
		zIndex: 2,
	},
	badge: {
		display: "inline-flex",
		alignItems: "center",
		gap: "6px",
		background: "#F5F5F3",
		border: "0.5px solid #888780",
		borderRadius: "20px",
		padding: "4px 14px",
		fontSize: "12px",
		fontWeight: 500,
		color: "#2C2C2A",
		marginBottom: "1.25rem",
		position: "relative",
		zIndex: 2,
	},
	heading: {
		fontSize: "22px",
		fontWeight: 500,
		color: "#1A1A18",
		margin: "0 0 0.75rem",
		lineHeight: "1.3",
		position: "relative",
		zIndex: 2,
	},
	body: {
		fontSize: "14px",
		color: "#6B6966",
		lineHeight: "1.65",
		margin: "0 0 2rem",
		maxWidth: "360px",
		position: "relative",
		zIndex: 2,
	},
};

const DashboardPlaceholder = () => {
	return (
		<div>
			<SectionHeader title={""} hideSidebarToggle />

			<div style={styles.wrap}>
				{/* Crane illustration */}
				<div style={styles.crane}>
					<svg viewBox="0 0 180 180" width="180" height="180" aria-hidden="true">
						{/* Mast */}
						<rect x="84" y="40" width="8" height="110" fill="#2C2C2A" rx="2" />
						{/* Jib */}
						<rect x="40" y="40" width="92" height="8" fill="#2C2C2A" rx="2" />
						{/* Counter-jib cap */}
						<rect x="38" y="32" width="12" height="20" fill="#2C2C2A" rx="2" />
						{/* Support cables */}
						<line x1="84" y1="40" x2="44" y2="110" stroke="#B0ACA6" strokeWidth="1.5" />
						<line x1="88" y1="40" x2="128" y2="110" stroke="#B0ACA6" strokeWidth="1.5" />
						<line x1="88" y1="48" x2="126" y2="48" stroke="#B0ACA6" strokeWidth="1.5" />
						{/* Animated load — bobs up and down */}
						<g>
							<line x1="130" y1="48" x2="130" y2="92" stroke="#6B6966" strokeWidth="1.5" strokeDasharray="3,3" />
							<rect x="118" y="92" width="24" height="20" fill="#F5F5F3" stroke="#888780" strokeWidth="1" rx="2" />
							<line x1="124" y1="92" x2="124" y2="112" stroke="#888780" strokeWidth="0.75" />
							<line x1="130" y1="92" x2="130" y2="112" stroke="#888780" strokeWidth="0.75" />
							<line x1="136" y1="92" x2="136" y2="112" stroke="#888780" strokeWidth="0.75" />
							<animateTransform
								attributeName="transform"
								attributeType="XML"
								type="translate"
								values="0,0; 0,10; 0,0"
								dur="3s"
								repeatCount="indefinite"
								calcMode="spline"
								keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
							/>
						</g>
						{/* Building under construction */}
						<rect x="72" y="140" width="16" height="26" fill="#F5F5F3" stroke="#E0DDD6" strokeWidth="1" rx="2" />
						<rect x="56" y="130" width="12" height="36" fill="#F5F5F3" stroke="#E0DDD6" strokeWidth="1" rx="2" />
						{/* Floor slabs */}
						<rect x="40" y="148" width="100" height="6" fill="#B0ACA6" rx="2" />
						<rect x="40" y="154" width="100" height="6" fill="#D3D1C7" rx="2" />
						<rect x="40" y="160" width="100" height="6" fill="#8A8780" rx="2" />
						{/* Caution beam */}
						<rect x="56" y="120" width="70" height="8" fill="#2C2C2A" rx="2" />
						<circle cx="62" cy="124" r="4" fill="#FFFFFF" opacity="0.5" />
						<circle cx="120" cy="124" r="4" fill="#FFFFFF" opacity="0.5" />
					</svg>
				</div>
				{/* Pulsing badge */}
				<div style={styles.badge}>
					<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
						<circle cx="5" cy="5" r="4" fill="#2C2C2A">
							<animate attributeName="r" values="4;2.5;4" dur="1.2s" repeatCount="indefinite" />
							<animate attributeName="opacity" values="1;0.6;1" dur="1.2s" repeatCount="indefinite" />
						</circle>
					</svg>
					Under development
				</div>
				<h1 style={styles.heading}>We&apos;re still building this page</h1>
				<p style={styles.body}>
					While we get the wiring in and the drywall up, use the navigation to access your modules.
				</p>
			</div>
		</div>
	);
};

export default DashboardPlaceholder;
