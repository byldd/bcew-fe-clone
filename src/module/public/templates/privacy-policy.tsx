"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, CheckCircle2, ShieldCheck, Mail, Phone, Database } from "lucide-react";

const SECTIONS = [
	{ id: "introduction", title: "1. Introduction", icon: ShieldCheck },
	{ id: "information-collection", title: "2. Information We Collect", icon: Database },
	{ id: "sms-communications", title: "3. SMS Communications & Consent", icon: Phone },
	{ id: "data-sharing", title: "4. Information Sharing", icon: Copy },
	{ id: "data-security", title: "5. Data Security & Retention", icon: CheckCircle2 },
	{ id: "contact-us", title: "6. Contact Us", icon: Mail },
];

const PrivacyPolicy = () => {
	const [activeSection, setActiveSection] = useState(SECTIONS[0]?.id);

	useEffect(() => {
		const handleScroll = () => {
			const currentSection = SECTIONS.map((s) => document.getElementById(s.id)).find((el) => {
				if (!el) return false;
				const rect = el?.getBoundingClientRect();
				return rect && rect.top >= 0 && rect.top <= window.innerHeight / 2;
			});

			if (currentSection) {
				setActiveSection(currentSection.id);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			const y = element.getBoundingClientRect().top + window.scrollY - 100;
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	};

	return (
		<div className="relative min-h-screen bg-brand-bgLightgrey font-inter">
			<div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
				{/* Header */}
				<div className="mb-12 flex flex-col items-center justify-center text-center lg:mb-20">
					<h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-5xl lg:text-6xl">
						Privacy Policy
					</h1>
					<p className="mt-4 text-lg text-gray-500">
						Effective Date: <span className="font-semibold text-gray-900">February 17, 2026</span>
					</p>
				</div>
			</div>
		</div>
	);
};

export default PrivacyPolicy;
