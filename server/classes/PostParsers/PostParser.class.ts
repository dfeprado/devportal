import { Token, TokensList, lexer, parser } from "marked";
import { PostHeaderParser } from "./PostHeaderParser.class";
import { PostReader } from "./PostReader.interface";
import { ParsedPost, TocEntry } from "~/interfaces/Post.interfaces";

export class PostParser {
    private headerParser: PostHeaderParser;
    private bodyTokens?: TokensList;

    constructor(private readonly reader: PostReader) {
        this.headerParser = new PostHeaderParser(reader);
    }

    async parse(): Promise<ParsedPost> {
        const header = await this.headerParser.parse();
        await this.parseBody();

        return {
            header,
            body: parser(this.bodyTokens!),
            toc: this.parseToc(),
        }
    }


    private async parseBody(): Promise<void> {
        const bodyString = await this.reader.readBody();
        this.bodyTokens = lexer(bodyString);
    }

    private parseToc(): TocEntry[] | null {
        const toc = this.bodyTokens!
            .filter((token: Token) => token.type === 'heading')
            .map((heading: any) => ({ title: heading.text, depth: heading.depth }))

        return toc.length ? toc : null;
    }
}