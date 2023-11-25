import { unlink } from "fs/promises";
import { PostReader } from "../PostParsers/PostReader.interface";
import { LowApiPostReader } from "./LowApiPostReader.class";
import { writePost } from "./PostReader.test-class.test"

describe('Low Api Post Reader', () => {
    let reader: PostReader;
    let postPath: string;

    afterEach(async () => {
        await reader.close();
        await unlink(postPath);
    })
    
    test('Read header and body', async () => {
        postPath = await writePost(
`title: Post
author: A <a>
---
This is a simple post`
        );

        reader = new LowApiPostReader(postPath);

        const header = await reader.readHeader();
        expect(header).toBe('title: Post\nauthor: A <a>\n');

        const body = await reader.readBody();
        expect(body).toBe('\nThis is a simple post');
    })

    test('Fail when file has no header', async () => {
        postPath = await writePost(`Headerless post`);

        reader = new LowApiPostReader(postPath);

        expect(async () => await reader.readHeader()).rejects.toThrow(Error);
        expect(async () => await reader.readBody()).rejects.toThrow(Error);
    })
})