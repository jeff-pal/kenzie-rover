import SpaceProbeController from "../protocols/spaceProbeController";
import {log, warn} from "../../helpers/adapters/consoleAdapter";

export default class SpaceProbeControllerAdapter implements SpaceProbeController{
    outputStream?: NodeJS.WriteStream;
    plateauMeshCoordinates = {
        limit: {
            x: 0,
            y: 0
        },
        initial: {
            x: 0,
            y: 0
        }
    }
    
    entryInstruction = {
        spaceProbeName: null,
        initialPosition: null,
        directions: null
    }
    
    questionIndex = 0;
    
    instructionQueueExit = [];
    test:string;

    questions = [
        'Top Right Coordinate (x y): ',
        'Initial position (x y d): ',
        'Directions: '
    ];
    
    cardinalCoordinates = ['N', 'E', 'S', 'W'];

    nexQuestion() {
        this.questionIndex =  (this.questionIndex + 1) % this.questions.length;
        if(this.questionIndex === 0) {
            this.questionIndex++;
        }
    }

    getTopRightCoordinate(entry) {
        entry = entry.replace(/\r?\n|\r|(\s)+$/g, "");
        const entryValues = entry.split(' ');
    
        if (entryValues.length !== 2) {
            warn('Invalid top right coordinate point!');
        } else {
            const maxX = Number(entryValues[0]);
            const maxY = Number(entryValues[1]);
            
            if(isNaN(maxX) || isNaN(maxY)) {
                warn('Invalid data format!');
                return;
            }
            return { maxX, maxY }
        }
    
    }

    topRightCoordinateIsNotSet() {
        return this.plateauMeshCoordinates.limit.x === 0 && this.plateauMeshCoordinates.limit.y === 0;
    }
    
    topRightCoordinateIsSet() {
        return !this.topRightCoordinateIsNotSet();
    }

    isInvalidCardinalDirection(cardinalDirection) {
        cardinalDirection = String(cardinalDirection).toLowerCase();
        const cardinalDirections = [ 'n', 'e', 's', 'w'];
        return !cardinalDirections.includes(cardinalDirection);
    }
    
    getSpaceProbeInitialPosition(entry) {
        entry = entry.replace(/\r?\n|\r|(\s)+$/g, "");
        const entryValues = entry.split(' ');
    
        if (entryValues.length !== 3) {
            warn('Invalid initial position!');
        } else {
            const x = Number(entryValues[0]);
            const y = Number(entryValues[1]);
            const d = entryValues[2];
        
            if(isNaN(x)) {
                warn("'x' is not a number!");
            } else if(isNaN(y)) {
                warn("'y' is not a number!");
            } else if(this.isInvalidCardinalDirection(d)) {
                warn("Invalid direction!");
            } else if(x > this.plateauMeshCoordinates.limit.x) {
                warn(`'x' must to be less than or equal to ${this.plateauMeshCoordinates.limit.x}`);
            } else if(y > this.plateauMeshCoordinates.limit.y) {
                warn(`'y' must to be less than or equal to ${this.plateauMeshCoordinates.limit.y}`);
            } else if(x < this.plateauMeshCoordinates.initial.x) {
                warn(`'x' must to be greater than or equal to ${this.plateauMeshCoordinates.limit.x}`);
            } else if(y < this.plateauMeshCoordinates.initial.y) {
                warn(`'y' must to be greater than or equal to ${this.plateauMeshCoordinates.limit.y}`);
            }
            else {
                return { x, y, d }
            }
        }
    
    }
    
    getDirections(entry) {
        entry = entry.replace(/\r?\n|\r|(\s)+$/g, "");
        const entryValues = entry.split('');
    
        if(entryValues.length >= 1) {
            return entryValues;
        }
    }
    
    clearEntrySpaceProbe() {
        this.entryInstruction.spaceProbeName = null;
        this.entryInstruction.initialPosition = null;
        this.entryInstruction.directions = null;
    }

    isToRotate(command: string) {
        command = command.toUpperCase();
        return command === 'R' || command === 'L';
    }

    isToMove(command: string) {
        command = command.toUpperCase();
        return command === 'M';
    }

    move(direction: string, currentPosition) {
        switch (direction.toUpperCase()) {
            case 'E':
                currentPosition.x++;
                break;
            case 'W':
                currentPosition.x--;
                break;
            case 'N':
                currentPosition.y++;
                break;
            case 'S':
                currentPosition.y--;
                break;
            default:
                break;
        }
        return currentPosition;
    }

    rotate(command: string, currentDirectionIndex: number) {
        command = command.toUpperCase();
        if(command === 'R') {
            currentDirectionIndex = (currentDirectionIndex + 1) % this.cardinalCoordinates.length;

        } else if(command === 'L') {
            const lastDirectionIndex = this.cardinalCoordinates.length - 1;
            const leftDirectionIndex = currentDirectionIndex - 1;
            currentDirectionIndex = currentDirectionIndex === 0 ? lastDirectionIndex : leftDirectionIndex;
        }
        return currentDirectionIndex;
    }

    processIncomingInstruction (instruction) {
        const movements = instruction.directions;

        let currentDirection = instruction.initialPosition.d;
        let currentDirectionIndex = this.cardinalCoordinates.indexOf(currentDirection);
        let currentPosition = {
            x: instruction.initialPosition.x,
            y: instruction.initialPosition.y,
            d: currentDirection
        }
        
        movements.forEach((movement, index) => {
            movement = movement.toUpperCase();
            
            if(this.isToMove(movement)) {
                currentPosition = this.move(currentDirection, currentPosition);
            } else if(this.isToRotate(movement)) {
                currentDirectionIndex = this.rotate(movement, currentDirectionIndex);
            }
            currentDirection = this.cardinalCoordinates[currentDirectionIndex]
            currentPosition.d = currentDirection;
            
        });
        this.outputStream.write(`${currentPosition.x} ${currentPosition.y} ${currentPosition.d}\n`)
    };

    getInstructionsSequency(data:string, remainingData: boolean, outputStream?: NodeJS.WriteStream) {
        this.outputStream = outputStream;
        log(data);
        if(this.topRightCoordinateIsNotSet()) {
            const topRightCoordinate = this.getTopRightCoordinate(data);

            if(topRightCoordinate) {
                this.plateauMeshCoordinates.limit.x = topRightCoordinate.maxX;
                this.plateauMeshCoordinates.limit.y = topRightCoordinate.maxY;
                this.nexQuestion();
            }

        } else {
            if(this.entryInstruction.spaceProbeName) {
                const directions = this.getDirections(data);
                if(directions) {
                    this.entryInstruction.directions = directions;
                    this.instructionQueueExit.push(this.entryInstruction);
                    this.processIncomingInstruction(this.entryInstruction)
                    this.clearEntrySpaceProbe();
                    this.nexQuestion();
                }
            } else {
                const spaceProbeInitialPosition = this.getSpaceProbeInitialPosition(data);
                if(spaceProbeInitialPosition) {
                    this.entryInstruction.spaceProbeName = this.instructionQueueExit.length + 1;
                    this.entryInstruction.initialPosition = spaceProbeInitialPosition;
                    this.nexQuestion();
                }
            }
        }
        if(remainingData) {
            log(this.questions[this.questionIndex]);
        }
        
    }
}