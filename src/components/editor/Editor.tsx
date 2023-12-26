import { useEffect, useMemo, useRef, useState } from "react";
import PushUpdate from "../misc/PushUpdate";
import CircleButton from "../posts/editor/CircleButton";
import Markdown from "@/markdown/Markdown";
import { useSession } from "next-auth/react";

interface EditorAreaProps {
    startingText?: string;
    requireAuth?: boolean;
    objectName: string;
    resourceMap?: { [key: string]: string };
}

const EditorArea = ({
    requireAuth = true,
    objectName,
    startingText,
    resourceMap = {},
}: EditorAreaProps) => {
    const editorArea = useRef<HTMLDivElement>(null);
    const [inEditMode, setInEditMode] = useState(false);
    const session = useSession();

    const [editorContentCurrentText, setEditorContentCurrentText] = useState(startingText);
    const editorContent = {
        get: () => {
            return editorContentCurrentText;
        },
        set: (text: string) => {
            if (editorArea.current) editorArea.current.innerText = text;
        },
        push: async () => {
            const body = {
                dataType: "str",
                data: editorContentCurrentText,
            };
            await fetch(`/api/objects`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    object: objectName,
                },
            });
        },
        fetch: async () => {
            fetch(`/api/objects`, {
                method: "GET",
                headers: {
                    object: objectName,
                },
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.status === "Success") setEditorContentCurrentText(res.data);
                })
                .then(() => {
                    setTimeout(() => {
                        if (editorArea.current && editorContentCurrentText)
                            editorArea.current.innerText = editorContentCurrentText;
                    }, 0);
                });
        },
    };

    useEffect(() => {
        if (!startingText) editorContent.fetch();
    }, []);

    return (
        <div>
            {requireAuth && session.status === "authenticated" && (
                <div className="absolute z-50 -top-3 -right-3 flex flex-row gap-2">
                    {inEditMode && (
                        <div>
                            <PushUpdate
                                pushPostUpdates={async () =>
                                    await editorContent
                                        .push()
                                        .then(() => setTimeout(() => setInEditMode(false), 3000))
                                        .then(() => editorContent.fetch())
                                }
                            />
                        </div>
                    )}

                    <div>
                        <CircleButton
                            action={() => {
                                setInEditMode(!inEditMode);
                                editorContent.fetch();
                            }}
                            iconSrc="/icons/edit.svg"
                            iconAlt="Edit"
                        />
                    </div>
                </div>
            )}

            {inEditMode && (
                <div
                    ref={editorArea}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={() =>
                        setEditorContentCurrentText(editorArea.current?.innerText || "")
                    }
                    className="markdown w-full h-full bg-transparent rounded-lg focus:outline-none"
                />
            )}
            {!inEditMode && (
                <div className="mt-2">
                    <Markdown markdown={editorContentCurrentText} resourceMap={resourceMap} />
                </div>
            )}
        </div>
    );
};

export default EditorArea;
