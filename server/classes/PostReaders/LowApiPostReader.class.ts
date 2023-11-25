import { ReadPosition, close, open, read } from "fs";
import { PostReader } from "../PostParsers/PostReader.interface";

export class LowApiPostReader implements PostReader {
    private readonly expectHeaderOnFirstNBytes = 4096;
    private fd?: number;
    private header?: string;
    private noHeader = false;

    constructor(private readonly filePath: string) { }

    async readBody(): Promise<string> {
        await this.readHeader();
        this.checkInvalidPost();
        
        let readBody: string | null = await this.readBytes(4096, this.header!.length + 3);
        if (readBody === null) {
            return '';
        }

        let body = readBody;
        while ((readBody = await this.readBytes(4096)) !== null) {
            body += readBody;
        } 

        return body;
    }

    async readHeader(): Promise<string> {
        if (this.noHeader) {
            throw new Error("This post has no header");
        }
        
        if (this.header) {
            return this.header;
        }

        await this.openFile();

        let headerContent = '';
        let readContent: string | null;
        let endOfHeaderIdx: number = -1;

        while ((readContent = await this.readBytes(1024)) !== null) {
            if (readContent === null) {
                break;
            }

            headerContent += readContent;

            if (headerContent.length >= this.expectHeaderOnFirstNBytes) {
                throw new Error(`Header wasn't found withing the first ${this.expectHeaderOnFirstNBytes} bytes of the file.`);
            }

            endOfHeaderIdx = headerContent.indexOf('---');
            if (endOfHeaderIdx !== -1) {
                headerContent = headerContent.substring(0, endOfHeaderIdx);
                break;
            }
        }

        if (endOfHeaderIdx === -1) {
            this.noHeader = true;
            throw new Error('Header not found on the entire file');
        }

        this.header = headerContent;

        return headerContent;
    }

    private async openFile(): Promise<void> {
        if (this.fd) {
            return;
        }

        return new Promise<void>((resolve, reject) => {

            open(this.filePath, 'r', (err, fd) => {
                if (err) {
                    reject(err);
                    return;
                }

                this.fd = fd;
                resolve();
            })
        });
    }

    private checkInvalidPost() {
        if (this.fd && !this.header) {
            throw new Error("This post has no header");
        }
    }

    private async readBytes(size: number, position: ReadPosition | null = null): Promise<string | null> {
        return new Promise<string | null>((resolve, reject) => {
            const buffer = Buffer.allocUnsafe(size);
            
            read(this.fd!, buffer, 0, size, position, (err, bytesRead, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (bytesRead === 0) {
                    resolve(null);
                    return;
                }

                resolve(bytesRead === size ? buffer.toString() : buffer.subarray(0, bytesRead).toString());
            });
        });
    }

    async close(): Promise<void> {
        if (!this.fd) {
            return;
        }

        return new Promise<void>((resolve, reject) => {
            close(this.fd!, err => {
                if (err) {
                    reject(err);
                    return;
                }

                this.fd = undefined;
                resolve();
            })
        })
    }

}