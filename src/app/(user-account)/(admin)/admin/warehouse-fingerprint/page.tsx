import FingerprintSdkLoader from "@/module/warehouse-fingerprint/components/fingerprint-sdk-loader";
import EmployeeList from "@/module/warehouse-fingerprint/templates/employee-list";

export default function WarehouseFingerprintPage() {
	return (
		<>
			<FingerprintSdkLoader />
			<EmployeeList />
		</>
	);
}
