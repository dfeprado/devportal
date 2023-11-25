import { PostHeaderParser } from "./PostHeaderParser.class";
import { MockPostReader } from "./MockPostReader.test-class.test";

describe('Post Header Parser', () => {
    test('Header is mandatory', async () => {
        const content = new MockPostReader('A simple content');

        expect(async () => await new PostHeaderParser(content).parse()).rejects.toThrow(Error);
    })

    test('Header tags is optional', async () => {
        const content = new MockPostReader(`
            title: My Post
            author: Author <author@email.com>
            ---
        `);

        const header = await new PostHeaderParser(content).parse();
        expect(header.title).toBe('My Post');
        expect(header.author.name).toBe('Author');
        expect(header.tags).toBeNull();
    })
})