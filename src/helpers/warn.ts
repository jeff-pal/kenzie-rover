export default function warn(text) {
    console.log(`\u001b[31;1m${text}`);
    process.stdout.write('\u001b[0m');
}