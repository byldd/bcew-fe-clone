"use client";

import MaterialRequestsTemplate from "./material-requests/templates/material-requests-template";

export default function CombinedMaterialTemplate({ showBackButton = false }: { showBackButton?: boolean }) {
	return <MaterialRequestsTemplate showBackButton={showBackButton} />;
}
