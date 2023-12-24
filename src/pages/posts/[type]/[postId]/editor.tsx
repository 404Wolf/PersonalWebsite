import Head from "next/head";
import MainLayout from "@/layouts/MainLayout";
import { useEffect, useRef, useState } from "react";
import Markdown from "@/markdown/Markdown";
import { useSession } from "next-auth/react";
import Restricted from "@/layouts/Restricted";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import PushUpdate from "@/components/misc/PushUpdate";
import Tags from "@/components/posts/Tags";
import GotoViewer from "@/components/posts/editor/GotoViewer";
import Tile from "@/components/misc/Tiles/Tile";
import TabTile from "@/components/misc/Tiles/Tabs";
import Resource from "@/components/posts/editor/resources/Resource";
import Resources from "@/components/posts/editor/resources/Resources";
import usePushPostUpdates from "@/utils/usePushPostUpdates";
import Field from "@/components/posts/editor/Field";
import DeletePost from "@/components/posts/editor/DeletePost";
import { ShowTabTile } from "@/components/misc/Tiles/Tabs";
import TextareaAutosize from "react-textarea-autosize";
import StatusLayout from "@/layouts/StatusLayout";

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    if (!params || typeof params.postId !== "string") {
        return { props: {} };
    }

    const post = await prisma.post.findUnique({
        where: { id: params.postId },
        include: { resources: true },
    });
    if (!post)
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };

    if (post) {
        const markdown = {
            id: post.markdown,
            data: await fetch(
                post.resources.filter((resource) => resource.id === post.markdown)[0].url
            ).then((resp) => resp.text()),
        };
        return {
            props: {
                post: {
                    id: post.id,
                    title: post.title,
                    type: post.type,
                    tags: post.tags,
                    description: post.description,
                    markdown: markdown,
                    covers: post.covers,
                    date: post.date,
                    notes: post.notes,
                },
                resources: post.resources.map((resource) => ({
                    id: resource.id,
                    title: resource.title,
                    filename: resource.filename,
                    type: resource.type,
                    description: resource.description,
                    url: resource.url,
                })),
            },
        };
    } else return { props: {} };
};

export interface EditorResource {
    id: string;
    title: string;
    filename: string;
    type: string;
    description: string;
    url: string;
}

export interface EditorPost {
    id: string;
    title: string;
    type: string;
    tags: string[];
    description: string;
    markdown: {
        id: string;
        data: string;
    };
    covers: string[];
    date: string;
    notes: string;
}

interface EditorProps {
    post: EditorPost;
    resources: EditorResource[];
}

const Editor = ({ post, resources }: EditorProps) => {
    const session = useSession();
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (session.status === "unauthenticated") router.push(`/posts/${post.type}/${post.id}`);
        else setReady(true);
        }, []);

    const [resourceMap, setResourceMap] = useState({});
    const [allResources, setAllResources] = useState(resources);
    const [showTabTile, setShowTabTile] = useState(true);

    const postStates = {
        id: useState(post.id),
        title: useState(post.title),
        type: useState(post.type),
        tags: useState(post.tags),
        description: useState(post.description),
        markdownId: useState(post.markdown.id),
        markdownData: useState(post.markdown.data),
        covers: useState(post.covers),
        date: useState(post.date),
        notes: useState(post.notes),
    };
    const [currentCovers, setCurrentCovers] = useState(post.covers);
    const [currentPostId, setCurrentPostId] = useState(post.id);
    const [currentPostType, setCurrentPostType] = useState(post.type);
    const pushPostUpdates = usePushPostUpdates(postStates, currentPostId, () => {
        setCurrentPostId(postStates.id[0]);
        setCurrentPostType(postStates.type[0]);
    });

    const postMarkdownAreaRef = useRef<HTMLTextAreaElement>(null);
    const postDescriptionAreaRef = useRef<HTMLTextAreaElement>(null);
    const postTitleAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newResourceMap: { [key: string]: string } = {};
        for (const resource of allResources) {
            if (resource) newResourceMap[resource.id] = resource.url;
        }
        setResourceMap(newResourceMap);
    }, [allResources]);

    const markdownArea = (
        <div className="-mt-4 overflow-y-auto overflow-x-clip px-5 pb-5">
            <Markdown markdown={postStates.markdownData[0]} resourceMap={resourceMap} />
        </div>
    );
    const resourceArea = (
        <div className="overflow-y-auto overflow-x-visible px-5 pb-5">
            <Resources
                resources={allResources}
                covers={currentCovers}
                setResources={setAllResources}
                setCovers={setCurrentCovers}
                postId={currentPostId}
                setMarkdown={(newMarkdownData: string, newMarkdownId: string) => {
                    if (postMarkdownAreaRef.current) {
                        postMarkdownAreaRef.current.value = newMarkdownData;
                    }
                    postStates.markdownId[1](newMarkdownId);
                }}
            />
        </div>
    );

    if (!ready) return <StatusLayout name={"Loading..."}>Loading...</StatusLayout>

    return (
        <Restricted>
            <>
                <Head>
                    <title>Post Editor</title>
                </Head>
                <MainLayout
                    title={post.title}
                    editableTitle={true}
                    onTitleEdit={(newTitle) => postStates.title[1](newTitle)}
                    titleRef={postTitleAreaRef}
                    header={false}
                    containerClasses="sm:-ml-4 lg:-mr-[7%] lg:-ml-[7%] xl:-mr-[12%] xl:-ml-[12%]"
                >
                    <div className="absolute -top-6 right-0 flex gap-1">
                        <Tags tags={postStates.tags[0]} setTags={postStates.tags[1]} />
                        <div className="-translate-y-6 scale-[90%] -mr-1">
                            <GotoViewer postId={postStates.id[0]} postType={postStates.type[0]} />
                        </div>
                        <div className="-translate-y-6 scale-[90%]">
                            <DeletePost postId={currentPostId} postType={currentPostType} />
                        </div>
                        <div className="-translate-y-6 scale-[90%]">
                            <PushUpdate pushPostUpdates={pushPostUpdates} />
                        </div>
                    </div>

                    <div className="mt-[12px] overflow-visible">
                        <div className="flex mb-4 md:mb-6 gap-4">
                            <Tile
                                containerClass="relative w-1/4"
                                title="Config"
                                direction="left"
                                className="mb-6"
                                type={false}
                            >
                                <div className="flex-col pt-2">
                                    <Field
                                        name="Date"
                                        nontallWidth="w-full"
                                        border={false}
                                        startValue={post.date}
                                        setValue={postStates.date[1]}
                                    />
                                    <div className="mt-4" />
                                    <Field
                                        name="Type"
                                        nontallWidth="w-full"
                                        border={false}
                                        startValue={post.type}
                                        setValue={postStates.type[1]}
                                    />
                                    <div className="mt-4" />
                                    <Field
                                        name="Notes"
                                        tall={true}
                                        border={false}
                                        startValue={post.notes}
                                        setValue={postStates.notes[1]}
                                    />
                                </div>
                            </Tile>

                            <Tile
                                containerClass="relative w-3/4"
                                title="Overview"
                                direction="left"
                                className="mb-6 pt-1"
                                type={false}
                            >
                                <TextareaAutosize
                                    onResize={(e) => {}}
                                    ref={postDescriptionAreaRef}
                                    onChange={(e) => postStates.description[1](e.target.value)}
                                    defaultValue={postStates.description[0]}
                                    className="h-fit w-full bg-transparent overflow-hidden resize-none focus:outline-none"
                                />
                            </Tile>
                        </div>

                        <div className="md:flex md:gap-4 relative">
                            <div
                                hidden={showTabTile}
                                className="absolute -right-5 -top-5 scale-75 z-50"
                            >
                                <ShowTabTile shown={showTabTile} setShown={setShowTabTile} />
                            </div>

                            <div className="absolute left-[127px] -top-3 z-50 text-sm px-[3px] bg-gray-500 rounded-xl text-white">
                                #{postStates.markdownId[0]}
                            </div>

                            <Tile
                                containerClass={`relative ${showTabTile ? "w-1/2" : "w-full"}`}
                                title="Markdown"
                                direction="left"
                                type={false}
                            >
                                <TextareaAutosize
                                onResize={(e) => {}}
                                    className="resize-none overflow-hidden
                                     bg-transparent w-full focus:outline-none"
                                    onChange={(e) => postStates.markdownData[1](e.target.value)}
                                    defaultValue={postStates.markdownData[0]}
                                    ref={postMarkdownAreaRef}
                                />
                            </Tile>

                            <div className="w-1/2 relative" hidden={!showTabTile}>
                                <TabTile
                                    tabs={[
                                        { key: 111, name: "Preview", element: markdownArea },
                                        { key: 112, name: "Resources", element: resourceArea },
                                    ]}
                                    shown={showTabTile}
                                    setShown={setShowTabTile}
                                />
                            </div>
                        </div>
                    </div>
                </MainLayout>
            </>
        </Restricted>
    );
};

export default Editor;
