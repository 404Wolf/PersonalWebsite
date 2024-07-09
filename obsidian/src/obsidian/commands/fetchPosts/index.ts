import MyPlugin from "src/main";
import Post from "src/404wolf/Post";
import { notify, toTitleCase } from "src/utils/misc";
import getActivePost, { ActivePostState } from "src/utils/404wolf";
import PostFetcher from "./PostFetcher";

/**
 * Fetches all the posts and stores them in the vault.
 */
export async function fetchPosts(plugin: MyPlugin) {
  const postIds = await Post.getAllPostIds(plugin);

  console.log(`Fetching posts ${postIds}`);
  notify(`Fetching ${postIds.length} posts...`);

  await Promise.all(
    postIds.map((postId: string) => {
      Post.fromId(plugin, postId).then((post: Post) => {
        const root = [plugin.settings.path, `${toTitleCase(post.type)}s`];
        const postFetcher = new PostFetcher(root, plugin, post);
        postFetcher.fetchPost({}).then(() => notify(`Fetched ${postId}`));
      });
    })
  );
}

/**
 * Fetches a specific post and stores it in the vault.
 */
export async function fetchPost(plugin: MyPlugin) {
  const [currentPost, postFetchStatus] = await getActivePost(plugin);
  if (postFetchStatus !== ActivePostState.VALID_POST) {
    notify("Failed to fetch post.");
    return;
  }

  notify(`Fetching post "${currentPost.id}"`);
  const root = [plugin.settings.path, `${toTitleCase(currentPost.type)}s`];
  const postFetcher = new PostFetcher(root, plugin, currentPost);
  await postFetcher.fetchPost({});
  notify(`Fetched post "${currentPost.id}"`);
}
