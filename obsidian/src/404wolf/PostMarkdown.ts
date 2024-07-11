import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import MyPlugin from "src/main";
import {
  createMarkdownWithFrontmatter,
  parseMarkdownWithFrontmatter,
  prependHeading,
  updateImageLinks
} from "src/utils/markdown";
import { unified } from "unified";
import { PostResource } from "./PostResource";
import Post from "./Post";

interface PostMarkdownMetadata {
  id: string;
  title: string;
  type: string;
  date: string;
  tags: string[];
  postDescription: string;
  cssclasses: string[];
}

export interface UnpackedPostMarkdown {
  postMarkdownMetadata: PostMarkdownMetadata;
  markdown: string;
}

export class PostMarkdown {
  constructor(
    public plugin: MyPlugin,
    public post: Post,
    public id: string,
    public data: string
  ) {}

  /**
   * Unpack the metadata from the markdown file itself to create a post.
   * @param {boolean} applyToPost Whether to apply the metadata to the post object.
   * @return {Promise<UnpackedPostMarkdown>}
   */
  unpackMetadataMarkdown = async (
    markdownWithMetadata: string,
    applyToPost: boolean = false
  ): Promise<UnpackedPostMarkdown> => {
    const { frontmatter: data, markdown } = parseMarkdownWithFrontmatter(
      markdownWithMetadata
    );
    const description = markdown.split("\n")[3];

    const imageFilenamesToIds = Object.fromEntries(
      this.post.resources.map((resource: PostResource) => [
        resource.filename,
        resource.id
      ])
    );
    const markdownWithoutDescription = markdown
      .split("\n")
      .slice(7)
      .join("\n");
    const markdownWithProperIds = await unified()
      .use(remarkParse)
      .use(updateImageLinks(imageFilenamesToIds))
      .use(remarkStringify)
      .process(markdownWithoutDescription)
      .then(result => result.toString());

    const postMarkdownMetadata = {
      id: data.id,
      title: data.title,
      type: data.type,
      date: data.date,
      tags: data.tags,
      postDescription: description,
      cssclasses: data.cssclasses
    };

    if (applyToPost) {
      this.post.id = postMarkdownMetadata.id;
      this.post.title = postMarkdownMetadata.title;
      this.post.type = postMarkdownMetadata.type;
      this.post.date = postMarkdownMetadata.date;
      this.post.tags = postMarkdownMetadata.tags;
      this.post.description = postMarkdownMetadata.postDescription;
      this.data = markdownWithProperIds;
      console.assert(this.post.markdown.data === this.data);
    }

    return {
      markdown: markdownWithoutDescription,
      postMarkdownMetadata
    };
  };

  /**
   * Pack post metadata into the markdown file itself.
   * @return {Promise<string>} The packaged markdown.
   */
  packMetadata = async (): Promise<string> => {
    const imageIdsToFilenames = Object.fromEntries(
      this.post.resources.map((resource: PostResource) => [
        resource.id,
        resource.filename
      ])
    );
    const frontmatter = {
      id: this.post.id,
      title: this.post.title,
      type: this.post.type,
      date: this.post.date,
      tags: this.post.tags,
      cssclasses: ["404WolfMarkdown"]
    };
    let result = await unified()
      .use(remarkParse)
      .use(updateImageLinks(imageIdsToFilenames))
      .use(prependHeading(1, "Description", this.post.description, true))
      .use(remarkStringify)
      .process(this.post.markdown.data)
      .then(result => result.toString());
    result = createMarkdownWithFrontmatter(frontmatter, result);
    return result;
  };
}
