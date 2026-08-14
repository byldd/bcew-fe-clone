"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import LocationPicker from "../components/location-picker";

const EnterLocation = () => {
	return (
		<div className="relative min-h-screen bg-brand-bgLightgrey px-4 py-10 font-inter sm:px-6 lg:py-16">
			<div className="mx-auto max-w-3xl">
				<div className="mb-8 flex flex-col items-center text-center">
					<div className="mb-6 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-900/5">
						<Image
							src="/assets/svg/bcew-logo.svg"
							alt="Company Logo"
							width={90}
							height={90}
							className="object-contain"
						/>
					</div>
					<div className="bg-brand-blue/10 mb-3 flex h-12 w-12 items-center justify-center rounded-full">
						<MapPin className="text-brand-blue h-6 w-6" />
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl">Incident Location</h1>
					<p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
						Pin the exact spot of the incident. Use your current location if you&apos;re on site, or search and drop a
						pin. We&apos;ll capture the GPS coordinates and generate a Google Maps link anyone can open.
					</p>
				</div>

				<div className="rounded-3xl bg-white p-5 shadow-md ring-1 ring-gray-900/5 sm:p-8">
					<LocationPicker />
				</div>
			</div>
		</div>
	);
};

export default EnterLocation;
