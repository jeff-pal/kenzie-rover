const fs = require('fs');

import IoStream from '../protocols/ioStream';
import { ReadLineCallback } from '../../types';

export default class IoStreamAdapter implements IoStream {
    private readonly filePath      : string;
    private readonly inputStream   : null | NodeJS.ReadStream;
    private readonly outputStream  : null | NodeJS.WriteStream;

    constructor(filePath:string) {
        this.filePath = filePath;
        this.outputStream = this.getOutputStream();
        this.inputStream = this.getInputStream(this.filePath);
    }

    private getInputStream(filePath: string): NodeJS.ReadStream | null {
        let input: null | NodeJS.ReadStream = process.stdin;
        if(filePath) {
            if (fs.existsSync(filePath)) {
                input = fs.createReadStream(filePath);
            } else {
                throw new Error('No such file!');
            }
        }
        input.setEncoding( 'utf8' );
        return input;
    }

    private getOutputStream(): NodeJS.WriteStream | null {
        return process.stdout;
    }

    readLine(callBack:ReadLineCallback) {
        this.inputStream.on('data', (data:string) => {
            data = data.replace(/(\n)+$/g, "");
            const chunks = data.split('\n');
            let isTyping = this.inputStream.isTTY; 

            chunks.forEach((chunk, index) => {
                const remainingData = isTyping || index < chunks.length-1; 
                callBack(chunk, remainingData, this.outputStream);
            });
        });
    }
}