import { Readable } from "stream";

/** A post mock for tests */
export class TestPost extends Readable {
    private pos = 0;
    
    constructor(private content: string) {
        super();
    }
    
    _read(size: number): void {
        const endpos = size ?? this.readableHighWaterMark;
        
        this.push(this.content.substring(this.pos, endpos));

        this.pos += endpos;
        if (this.pos >= this.content.length) {
            this.push(null);
        }    
    }
}