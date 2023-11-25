import { PostHeader } from "./Post.interfaces";
import { PostReader } from "./PostReader.interface";

export class PostHeaderParser {
    private header?: PostHeader;

    constructor(private readonly reader: PostReader) { }

    async parse(): Promise<PostHeader> {
        if (this.header) {
            return this.header!;
        }

        const rawHeader = await this.parseHeaderRaw();
        this.checkMandatoryHeaderTags(rawHeader);
        const authorParts = this.splitAuthorNameAndEmail(rawHeader);
        this.createHeader(rawHeader, authorParts);

        return this.header!;
    }

    private async parseHeaderRaw(): Promise<Record<string, string>> {
        const textHeader = await this.reader.readHeader();
        
        return textHeader
            .split('\n')
            .map((row, idx) => {
                row = row.trim();
                if (!row) {
                    return null;
                }

                const propValue = row.match(/^(title|author|tags):\s*(.+)\s*$/);
                if (!propValue) {
                    throw new Error(`Error on header: unknown line ${idx + 1}: ${row}`);
                }
                return [propValue[1], propValue[2].trim()];
            })
            .filter(r => r !== null)
            .reduce((rawHeader, row) => {
                rawHeader[row![0]] = row![1];

                return rawHeader;
            }, <Record<string, string>>{});
    }

    private checkMandatoryHeaderTags(rawHeader: Record<string, string>): void {
        for (const key of <(keyof PostHeader)[]>['author', 'title']) {
            if (!rawHeader[key]) {
                throw new Error(`No ${key} header found.`);
            }
        }
    }

    private splitAuthorNameAndEmail(rawHeader: Record<string, string>): [string, string] {
        const authorParts = rawHeader.author.match(/^(.+)\s*<(.+)>$/);
        if (!authorParts) {
            throw new Error(`Invalid author format. Should be Author Name <author email>. Found ${rawHeader.author}`);
        }
        return [authorParts[1].trim(), authorParts[2].trim()];
    }

    private createHeader(rawHeader: Record<string, string>, authorParts: [string, string]): void {
        this.header = {
            title: rawHeader.title,
            author: { name: authorParts[0], email: authorParts[1] },
            tags: rawHeader.tags ? rawHeader.tags.split(',').map(t => t.trim()).filter(t => !!t) : null,
        };

        Object.freeze(this.header);
    }
}