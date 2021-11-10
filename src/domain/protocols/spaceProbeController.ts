export default interface SpaceProbeController {
    getInstructionsSequency: (data:string, remainingData: boolean, outputStream?: NodeJS.WriteStream) => void;
    processIncomingInstruction: (instructions) => void;
} 