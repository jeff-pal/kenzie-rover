import IoStreamAdapter from './src/infrastructure/adapters/ioStreamAdapter';
import SpaceProbeControllerAdapter from './src/domain/adapters/spaceProbeControllerAdapter';
import { log } from './src/helpers/adapters/consoleAdapter';

const args = process.argv.slice(2)
const fileFlag = args.indexOf('-f');

let filePath: null | string = fileFlag >= 0 ? process.argv[fileFlag + 1] : null;

const ioStream = new IoStreamAdapter(filePath);
const spaceProbeController = new SpaceProbeControllerAdapter();

function readLineCallback(data, remainingData, outputStream) {
    spaceProbeController.getInstructionsSequency(data, remainingData, outputStream)
}

log('Top Right Coordinate (x y): ');
ioStream.readLine(readLineCallback);
