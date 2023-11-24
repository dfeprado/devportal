import { PostHeaderParser } from "./PostHeaderParser.class";
import { TestPost } from "./PostStreamBuilder.test-class.test";

describe('Post Header Parser', () => {
    test('Header is mandatory', () => {
        const content = new TestPost('A simple content');

        expect(() => new PostHeaderParser(content).parse()).toThrow(Error);
    })

    test('Header tags is optional', () => {
        const content = new TestPost(`
            title: My Post
            author: Author <author@email.com>
            ---
        `);

        const header = new PostHeaderParser(content).parse();
        expect(header.title).toBe('My Post');
        expect(header.author.name).toBe('Author');
        expect(header.tags).toBeNull();
    })
})