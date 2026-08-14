"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IoChevronBack } from "react-icons/io5";

const BackButton = () => {
	const router = useRouter();
	return (
		<Button type="button" onClick={() => router.back()} variant={"ghost"} size={"icon"} className="size-8">
			<IoChevronBack className="!size-6" />
		</Button>
	);
};

export default BackButton;
