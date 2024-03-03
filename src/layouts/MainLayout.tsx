"use client";

import Tile from "@/components/misc/Tiles/Tile";
import Link from "next/link";
import { RefObject, useEffect, useState } from "react";
import BasicContacts from "../components/contacts/BasicContacts";
import Header from "./header/Header";
import ProfileButton from "@/components/auth/ProfileButton";

export const metadata = {
    title: "Wolf Mermelstein Personal Website",
    description:
        "Enter the world of a creative student who loves tinkering, coding, Latin, tabletop, and more. Discover a portfolio of projects and blogs, and get their contacts.",
};

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string | JSX.Element;
    titleWidth?: string;
    editableTitle?: boolean;
    onTitleEdit?: (text: string) => void;
    titleRef?: RefObject<HTMLDivElement>;
    header?: boolean;
    defaultMetadata?: boolean;
    headerChildren?: JSX.Element;
    subtitleFixedWidth?: string;
    containerClasses?: string;
}

const MainLayout = ({
    children,
    title,
    titleWidth = "w-fit",
    editableTitle = false,
    onTitleEdit,
    titleRef,
    defaultMetadata = true,
    header = true,
    headerChildren,
    subtitleFixedWidth,
    containerClasses,
}: MainLayoutProps) => {
    let [blurred, setBlurred] = useState(false);
    const titleElementClasses = `absolute hover:brightness-90 -top-3 md:-top-5 -left-3 md:-left-5 bg-gray-700 text-white rounded-3xl sm:rounded-full py-[5px] md:py-2 sm:py-[6px] px-4 ${titleWidth} text-[22px] sm:text-[30px] font-bold z-30`;

    useEffect(() => {
        if (titleRef?.current && typeof title === "string") {
            titleRef.current.innerText = title;
        }
    }, []);

    return (
        <>
            <div className={containerClasses}>
                <div
                    className={`relative pt-7 sm:pt-8 duration-100 ${
                        blurred ? "blur-sm contrast-75" : ""
                    }`}
                >
                    {title && editableTitle ? (
                        <div
                            className={titleElementClasses}
                            onInput={(e) => {
                                if (onTitleEdit) onTitleEdit(e.currentTarget.textContent || "");
                            }}
                            contentEditable="true"
                            ref={titleRef}
                        />
                    ) : (
                        <Link href="/">
                            <div className={titleElementClasses}>{title}</div>
                        </Link>
                    )}

                    <div className={"hidden sm:block fixed bottom-2 right-2"}>
                        <ProfileButton size={18} />
                    </div>

                    <div className="hidden sm:block absolute sm:fixed sm:top-[7.7rem] -sm:right-[8rem] md:-right-[7.7rem] sm:rotate-90">
                        <BasicContacts />
                    </div>

                    <div className="bg-slate-500 p-6 rounded-3xl drop-shadow-4xl-c">
                        {header && (
                            <div className="pb-9">
                                <Tile fixedTitleWidth={subtitleFixedWidth}>
                                    <Header
                                        setBackgroundBlurred={setBlurred}
                                        children={headerChildren}
                                    />
                                </Tile>
                            </div>
                        )}

                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainLayout;
