import { randomListItem, toTitleCase } from "@/utils/misc";
import Head from "next/head";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import MainLayout from "@/layouts/MainLayout";
import Tile from "@/components/misc/Tiles/Tile";
import Image from "next/image";
import Markdown from "@/markdown/Markdown.jsx";
import Tags from "@/components/posts/Tags";
import GotoEditor from "@/components/posts/editor/GotoEditor";
import { useSession } from "next-auth/react";
import DeletePost from "@/components/posts/editor/DeletePost";
import useSize from "@/utils/useSize";
import { useWindowWidth } from "@react-hook/window-size";

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    if (!params) {
        return { props: {} };
    }

    const post = await prisma.post.findUnique({
        where: {
            id: params.postId as string,
        },
        include: {
            resources: true,
        },
    });

    if (post) {
        const resources: { [key: string]: string } = {};
        for (const resource of post.resources) {
            resources[resource.id] = resource.url;
        }
        const markdown = await fetch(resources[post.markdown]).then((res) => res.text());

        return {
            props: {
                type: params.type,
                id: params.postId,
                title: post.title,
                cover: resources[randomListItem(post.covers)] || null,
                description: post.description,
                tags: post.tags,
                markdown: markdown,
                resources: resources,
            },
        };
    } else {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
};

interface PostProps {
    type: string;
    id: string;
    title: string;
    cover: string;
    description: string;
    tags: string[];
    markdown: string;
    resources: { [key: string]: string };
}

const Post = ({ type, id, title, cover, description, tags, markdown, resources }: PostProps) => {
    const session = useSession();
    const windowWidth = useWindowWidth({ wait: 100, leading: true });

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="keywords" content={tags.join(",")} />
                <meta
                    name="description"
                    content={description}
                />
                <link rel="og:image" href={cover} />
            </Head>
            <MainLayout title={toTitleCase(title)} header={false} defaultMetadata={false}>
                <div className="mt-[12px] overflow-visible">
                    {session.status === "authenticated" && (
                        <div className="absolute -top-12 -right-4 scale-[90%] flex gap-3">
                            <DeletePost postId={id} postType={type} />
                            <div className="hidden sm:block">
                                <GotoEditor postId={id} postType={type} />
                            </div>
                        </div>
                    )}

                    <Tile title="Overview" direction="right">
                        <div className="h-fit overflow-auto">
                            {cover && (
                                <div className="relative pointer-events-none rounded-xl w-2/5 sm:w-1/4 sm:mt-4 sm:ml-2 float-right">
                                    <div className="max-h-[15rem] overflow-clip border-4 border-slate-500 rounded-xl">
                                        <Image
                                            width={400}
                                            height={400}
                                            src={cover}
                                            className="rounded-xl scale-[103%]"
                                            alt={`${title}'s cover image`}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="-mt-1 mb-2 sm:mb-1 text-[0.77em] sm:text-[1em]">
                                {description}
                            </div>
                        </div>
                    </Tile>

                    <div className="brightness-[125%] absolute left-2 -translate-y-6 z-50">
                        <Tags tags={tags} readOnly={true} />
                    </div>

                    <div className="m-6" />

                    <Tile
                        className="overflow-auto"
                        title={windowWidth > 500 ? title : undefined}
                        direction="right"
                    >
                        <div className="-mt-4">
                            <Markdown markdown={markdown} resourceMap={resources} />
                        </div>
                    </Tile>
                </div>
            </MainLayout>
        </>
    );
};

export default Post;
