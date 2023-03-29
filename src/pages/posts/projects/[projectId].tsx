import { useEffect, useState } from "react";
import { postById, postById as projectFromId } from "../../api/posts/byId";
import useSize from "@/utils/useSize";
import PostData from "../../../components/posts/PostData";
import { postMd as fetchMd } from "../../api/posts/md";
import { parseMd } from "@/utils/parseMd";
import PostLayout from "@/layouts/PostLayout";
import { listTypePosts } from "../../api/posts/listed";
import Head from "next/head";
import { randomListItem } from "@/utils/misc";

interface ProjectParams {
    params: {
        projectId: string;
    };
}

export async function getServerSideProps({ params: { projectId } }: ProjectParams) {
    return {
        props: {
            projectId: projectId,
            projectData: postById(projectId, "projects"),
            projectMd: fetchMd(projectId),
        },
    };
}

interface ProjectProps {
    projectId: string;
    projectData: PostData;
    projectMd: string;
}

const Project = ({ projectId, projectData, projectMd }: ProjectProps) => {
    const [parsedProjectMd, setParsedProjectMd] = useState("Loading...");
    const windowSize = useSize();

    useEffect(() => {
        projectMd &&
            setParsedProjectMd(parseMd(projectMd, projectId, windowSize[0]));
    }, [projectMd, projectId, windowSize]);

    return (
        <>
            <Head>
                <title>{`Projects/${projectId}`}</title>
            </Head>
            <PostLayout
                header={projectData.name}
                type="Project"
                md={parsedProjectMd}
                summary={projectData.description}
                icon={randomListItem(projectData.covers)}
            />
        </>
    );
};

export default Project;
