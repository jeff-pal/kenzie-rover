import Console from "../protocols/console";

class ConsoleAdapter implements Console {
    iterativeMode: boolean;
    
    constructor(iterativeMode) {
        this.iterativeMode = iterativeMode;
    }

    log(...props) {
        if(this.iterativeMode) {
            console.log(...props);
            process.stdout.write('\u001b[0m');
        }
    }
    
    warn(...props) {
        if(this.iterativeMode) {
            console.log(`\u001b[31;1m`, ...props);
            process.stdout.write('\u001b[0m');
        }
    }

    result(...props) {
        if(this.iterativeMode) {
            console.log(`\u001b[35m`, ...props);
            process.stdout.write('\u001b[0m');
        }
    }
}

const args = process.argv.slice(2);
const iterativeMode = Boolean(args.includes('--it'));    
const logger = new ConsoleAdapter(iterativeMode);

export {
    logger,
};


