import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

const BuilderCommunicationTrigger = () => {
	const router = useRouter();

	const handleClick = () => {
		router.push(routes.admin.builderComms);
	};

	return (
		<span className="h-10 w-10 rounded-[10px] active:shadow-[0px_4.34px_11.93px_0px_#00000040] 3xl:h-[80px] 3xl:w-[80px]">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						onClick={handleClick}
						variant="outline"
						className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 outline-none hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
					>
						<Image
							src={"/assets/svg/builder-communications.svg"}
							alt={"builder-communications"}
							width={28}
							height={28}
							className="3xl:h-[56px] 3xl:w-[56px]"
						/>
					</Button>
				</TooltipTrigger>

				<TooltipContent>
					<p>Builder Communications</p>
				</TooltipContent>
			</Tooltip>
		</span>
	);
};

export default BuilderCommunicationTrigger;
