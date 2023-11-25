import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

/** 
 * Writes a post to a temporary file, so that tests have files to read 
 * @returns absolute path to temporary post file
 */
export async function writePost(content: string): Promise<string> {
    const fileName = `temp-${Date.now()}.md`;
    const path = join(tmpdir(), fileName);

    await writeFile(path, content);

    return path;
}