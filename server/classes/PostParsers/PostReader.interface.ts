export interface PostReader {
    readHeader(): Promise<string>;
    readBody(): Promise<string>;
    close(): Promise<void>;
}

   // private readHeader(): string {
        // let headerContent = '';
        // let readContent: Buffer;
        // let endOfHeaderIdx: number = -1;

        // while ((readContent = this.content.read(this.headerBytesRead)) !== null) {
        //     headerContent += readContent.toString();

        //     if (headerContent.length >= this.expectHeaderOnFirstNBytes) {
        //         throw new Error("Header wasn't found withing the first 4096 bytes of the file.");
        //     }

        //     endOfHeaderIdx = headerContent.indexOf('---');
        //     if (endOfHeaderIdx !== -1) {
        //         this._bufferAfterHeader = headerContent.substring(endOfHeaderIdx + 3);
        //         headerContent = headerContent.substring(0, endOfHeaderIdx);
        //         break;
        //     }
        // }

        // if (endOfHeaderIdx === -1) {
        //     throw new Error('Header not found on the entire file');
        // }

        // return headerContent;
    // }

    // let bodyContent = this.headerParser.remainingBufferAfterHeader;
        // let contentRead: Buffer;
        // while ((contentRead = this.content.read()) !== null) {
        //     bodyContent += contentRead.toString();
        // }