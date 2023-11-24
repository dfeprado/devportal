import { Readable } from "stream";

export class PostHeaderParser {
    private _bufferAfterHeader = '';
    private readonly expectHeaderOnFirstNBytes = 4096;
    private readonly headerBytesRead = 256;
    private header?: PostHeader;

    constructor(private readonly content: Readable) { }

    get remainingBufferAfterHeader(): string {
        return this._bufferAfterHeader;
    }

    parse(): PostHeader {
        if (this.header) {
            return this.header!;
        }

        const rawHeader = this.parseRawHeader();
        this.checkMandatoryHeaderTags(rawHeader);
        const authorParts = this.splitAuthorNameAndEmail(rawHeader);
        this.createHeader(rawHeader, authorParts);

        return this.header!;
    }

    private parseRawHeader(): Record<string, string> {
        return this.readHeader()
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

    private readHeader(): string {
        let headerContent = '';
        let readContent: Buffer;
        let endOfHeaderIdx: number = -1;

        while ((readContent = this.content.read(this.headerBytesRead)) !== null) {
            headerContent += readContent.toString();

            if (headerContent.length >= this.expectHeaderOnFirstNBytes) {
                throw new Error("Header wasn't found withing the first 4096 bytes of the file.");
            }

            endOfHeaderIdx = headerContent.indexOf('---');
            if (endOfHeaderIdx !== -1) {
                this._bufferAfterHeader = headerContent.substring(endOfHeaderIdx + 3);
                headerContent = headerContent.substring(0, endOfHeaderIdx);
                break;
            }
        }

        if (endOfHeaderIdx === -1) {
            throw new Error('Header not found on the entire file');
        }

        return headerContent;
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

export interface PostHeader {
    title: string;
    author: {
        name: string;
        email: string;
    };
    tags: string[] | null;
}