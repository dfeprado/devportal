import { PostReader } from "../PostParsers/PostReader.interface";

export class MockPostReader implements PostReader {
    private readonly headerInitialIdx: number;
    
    constructor(private content: string) {
        this.headerInitialIdx = content.indexOf('---');
    }
    
    async readHeader(): Promise<string> {
        if (this.headerInitialIdx === -1) {
            throw new Error("There's no header on this file.");
        }

        return this.content.substring(0, this.headerInitialIdx);
    }

    async readBody(): Promise<string> {
        if (this.headerInitialIdx === -1) {
            throw new Error("There's no header on this file");
        }

        return this.content.substring(this.headerInitialIdx + 3);
    }

    async close(): Promise<void> {
        // Do nothing
    }
}