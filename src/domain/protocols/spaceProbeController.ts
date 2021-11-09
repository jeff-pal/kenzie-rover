export default interface SpaceProbeController {
    getInstructionsSequency: (data:string) => void;
    processIncomingInstruction: () => void;
} 