import { Token, TokensList, lexer, parser } from "marked";
import { Readable } from "stream";
import { PostHeader, PostHeaderParser } from "./PostHeaderParser.class";

export class PostParser {
    private headerParser: PostHeaderParser;
    private bodyTokens?: TokensList;

    constructor(private readonly content: Readable) {
        this.headerParser = new PostHeaderParser(content);
    }

    parse(): ParsedPost {
        const header = this.headerParser.parse();
        this.parseBody();

        return {
            header,
            body: parser(this.bodyTokens!),
            toc: this.parseToc(),
        }
    }


    private parseBody(): void {
        let bodyContent = this.headerParser.remainingBufferAfterHeader;
        let contentRead: Buffer;
        while ((contentRead = this.content.read()) !== null) {
            bodyContent += contentRead.toString();
        }

        this.bodyTokens = lexer(bodyContent);
    }

    private parseToc(): TocEntry[] | null {
        const toc = this.bodyTokens!
            .filter((token: Token) => token.type === 'heading')
            .map((heading: any) => ({ title: heading.text, depth: heading.depth }))

        return toc.length ? toc : null;
    }
}

interface TocEntry {
    title: string;
    depth: number;
};

export interface ParsedPost {
    header: PostHeader,
    body: string;
    toc: null | TocEntry[];
}