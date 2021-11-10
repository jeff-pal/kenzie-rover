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
}

const args = process.argv.slice(2);
const iterativeMode = Boolean(args.includes('--it'));    
const consoleAdapter = new ConsoleAdapter(iterativeMode);
const log = (...props) => consoleAdapter.log(...props);
const warn = (...props) => consoleAdapter.warn(...props);

export {
    log,
    warn,
};


