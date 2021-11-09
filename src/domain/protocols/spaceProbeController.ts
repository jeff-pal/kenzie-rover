export default interface SpaceProbeController {
    getInstructionsSequency: (data:string, remainingData: boolean) => void;
    processIncomingInstruction: (instructions) => void;
} 