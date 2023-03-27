import Link from "next/link";
import Tag from "../misc/Tag";

interface mdImageProps {
    tag?: string;
    alt?: string;
    src: string;
    float?: "left" | "right" | "none";
    imageClasses?: string;
    styles?: object;
}

const MdImage = ({ tag, alt, src, float, imageClasses, styles={} }: mdImageProps) => {
    return (
        <Link href={ src } target="_blank" rel="noopener noreferrer">
            <div className="relative inline-block float-right container my-2 duration-100 hover:scale-105" style={ styles }>
                <img
                    src={ src }
                    alt={ tag || alt }
                    className={ `rounded-xl border-slate-500 bg-slate-200 border-4 ${imageClasses}` }
                />
                {tag && <Tag position={ (float === "none") ? null : ((float == "left") ? "br" : "bl") }>
                    { tag }
                </Tag>}
            </div>
        </Link>
    );
}
 
export default MdImage;