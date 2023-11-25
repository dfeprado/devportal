import { readdir } from "fs/promises"
import { PostHeaderParser } from "../classes/PostParsers/PostHeaderParser.class";
import { LowApiPostReader } from "../classes/PostReaders/LowApiPostReader.class";
import { join } from "path";
import { Post } from "~/interfaces/Post.interfaces";

export default eventHandler(async () => {
    try {
        const result: Post[] = [];
        const posts = await readdir('posts', { withFileTypes: true });
        
        for (const post of posts) {
            const postReader = new LowApiPostReader(join('posts', post.name, 'post.md'));
            try {
                result.push({
                    slug: post.name,
                    header: await new PostHeaderParser(postReader).parse(),
                });
            } catch (err) {
                console.error(err);
            } finally {
                await postReader.close();
            }
        }

        return result;

    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return [];
        } else {
            throw err;
        }
    }
})