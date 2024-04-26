import BasicPostCardGrid from "@/components/posts/BasicPostCardGrid";
import MainLayout from "@/layouts/MainLayout";
import Greeter from "@/layouts/header/Greeter";
import Tile from "@/components/misc/Tiles/Tile";
import InlineButton from "@/components/misc/InlineButton";
import EditorArea from "@/components/editor/Editor";
import s3 from "@/utils/aws";
import HoverImageChange from "@/components/displays/HoverImageChange";
import { BasicPostData } from "@/components/posts/BasicPostCard";
import { PrismaClient } from "@prisma/client";
import { getAboutData } from "@/app/api/about/worker";
import { CSSProperties } from "react";

const prisma = new PrismaClient();

async function getFeaturedPosts() {
    return (
        await prisma.post.findMany({
            where: {
                tags: {
                    has: "featured",
                },
            },
            include: {
                resources: true,
            },
        })
    ).map(
        (post) =>
        ({
            coverUrls: post.resources.filter(resource => post.covers.includes(resource.id)).map((resource) => resource.url),
            coverAlts: post.resources.filter(resource => post.covers.includes(resource.id)).map((resource) => resource.description),
            path: `/posts/${post.type}/${post.id}`,
            type: post.type,
            tags: post.tags,
            date: post.date!,
            title: post.title,
        } as BasicPostData)
    );
}

export default async function Home() {
    const basicAbout = (
        await s3.getResource(process.env.NEXT_PUBLIC_BASIC_ABOUT_OBJECT_NAME!, "utf-8")
    )?.toString();
    const about = getAboutData();

    const featuredPosts = await getFeaturedPosts();

    const profileImageMe = "/resources/profileMeAlt.webp";
    const profileImageDog = "/resources/profileDog.webp";

    const headerChildren = (
        <div>
            <div className="hidden xs:block xs:h-32 xs:w-32 md:h-30 md:w-30 relative float-right ml-1 sm:ml-2">
                <HoverImageChange imageSrc1={profileImageMe} imageSrc2={profileImageDog} />
            </div>

            <div className="markdown">
                <p className="mb-2">
                    I'm a <InlineButton externalTo="https://case.edu">CWRU</InlineButton> student
                    with a passion for tinkering, tech, coding, Ancient Latin, D&D, strategy board
                    games, creating, designing, engineering, geeking, making, and figuring things
                    out.
                </p>
                <p>
                    Information, projects, contacts, my resume, and more can be found on this
                    website. If you have any questions, feel free to{" "}
                    <InlineButton externalTo={`mailto:${about.email}`}>email</InlineButton>!
                </p>
            </div>
        </div>
    );

    const heightStyle = { maxHeight: "600px", overflowY: 'auto' } as CSSProperties;

    return (
        <MainLayout
            title={<Greeter />}
            headerChildren={headerChildren}
        >
            <div className="flex flex-col gap-7">
                <div className="flex flex-col min-[520px]:flex-row gap-7 sm:gap-6">
                    <div className="sm:basis-[30%] overflow-visible">
                        <Tile title="Featured" className="overflow-visible">
                            <div className="overflow-visible z-50" style={heightStyle}>
                                <BasicPostCardGrid
                                    onlyFeatured
                                    posts={featuredPosts}
                                    showTags={["ongoing"]}
                                    gridConfig="grid-cols-2 min-[520px]:grid-cols-1"
                                />
                            </div>
                        </Tile>
                    </div>

                    <div className="basis-[75%]">
                        <Tile title="About">
                            <div style={heightStyle}>
                                <EditorArea
                                    startingText={basicAbout || "Loading..."}
                                    objectName={process.env.NEXT_PUBLIC_BASIC_ABOUT_OBJECT_NAME!}
                                />
                            </div>
                        </Tile>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
