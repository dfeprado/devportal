import { PostParser } from "./PostParser.class";
import { TestPost } from "./PostStreamBuilder.test-class.test";

describe('Post Parser', () => {
    test('Parse a post', () => {
        const content = new TestPost(`
title: My Content
author: Author <author@email.com>
tags: tag 1, tag 2, tag 3,tag4,
---
A simple content`);

        const parsedContent = new PostParser(content).parse()

        expect(parsedContent.header.title).toBe('My Content')
        expect(parsedContent.header.author.name).toBe('Author')
        expect(parsedContent.header.author.email).toBe('author@email.com')
        expect(parsedContent.header.tags).toHaveLength(4)
        expect(parsedContent.header.tags).toEqual(['tag 1', 'tag 2', 'tag 3', 'tag4'])
        expect(parsedContent.toc).toBeNull();
        expect(parsedContent.body).toBe('<p>A simple content</p>\n')
    })

    test('Parse table of contents (toc)', () => {
        const content = new TestPost(`
title: My Content
author: Author <author@email.com>
---
# Introduction
This is a simple introduction

# First header
## First subheader
Text

# Second Header
## Second subheader
### Second sub-subheader

Text`)

        const parsedContent = new PostParser(content).parse();
        expect(parsedContent.toc).not.toBeNull();
        expect(parsedContent.toc!).toHaveLength(6);
        expect(parsedContent.toc![0]).toEqual({ title: 'Introduction', depth: 1 });
        expect(parsedContent.toc![1]).toEqual({ title: 'First header', depth: 1 });
        expect(parsedContent.toc![2]).toEqual({ title: 'First subheader', depth: 2 });
        expect(parsedContent.toc![3]).toEqual({ title: 'Second Header', depth: 1 });
        expect(parsedContent.toc![4]).toEqual({ title: 'Second subheader', depth: 2 });
        expect(parsedContent.toc![5]).toEqual({ title: 'Second sub-subheader', depth: 3 });
    })

    test('Empty post with header should be ok', () => {
        const content = new TestPost(
`title: My Post
author: Author <author@email.com>
tags: tag1
---`
        );

        const parsedContent = new PostParser(content).parse();
        expect(parsedContent.toc).toBeNull();
        expect(parsedContent.body).toBe('');
    });
})