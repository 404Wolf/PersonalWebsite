import PostData from "@/components/posts/PostData";
import PostsIndexLayout from "@/layouts/PostsIndexLayout";
import Head from "next/head";
import { useEffect, useState } from "react";

const Projects = () => {
    return (
        <>
            <Head>
                <title>Projects</title>
            </Head>
            <PostsIndexLayout header="Projects" type="projects">
                This page is to showcase some of the projects I've worked on. It's a healthy blend of personal projects, academic projects, and more. Not all the projects are code-related, but many are. Each project has its own page with more information about it, so feel free to click on any of them to learn more. If you have any questions, feel free to contact me. More projects will be coming soon!
            </PostsIndexLayout>
        </>
    );
};

export default Projects;
