import SpaceProbeController from "../protocols/spaceProbeController";
import {log, warn} from "../../helpers/adapters/consoleAdapter";
import { Coordinate } from "../../types";
import GreedyBestFirstSearch from "../../data/greedyBestFirstSearch";

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
        commands: null
    }
    questionIndex = 0;
    instructionQueueExit = [];
    questions = [
        'Top Right Coordinate (x y): ',
        'Initial position (x y d): ',
        'Directions: '
    ];
    cardinalCoordinates = ['N', 'E', 'S', 'W'];

    placedSpaceProbes: Coordinate[] = [];

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
            const cardinalDirection = entryValues[2];
        
            if(isNaN(x)) {
                warn("'x' is not a number!");
            } else if(isNaN(y)) {
                warn("'y' is not a number!");
            } else if(this.isInvalidCardinalDirection(cardinalDirection)) {
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
                return { x, y, cardinalDirection }
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
        this.entryInstruction.commands = null;
    }

    isToRotate(command: string) {
        command = command.toUpperCase();
        return command === 'R' || command === 'L';
    }

    isToMove(command: string) {
        command = command.toUpperCase();
        return command === 'M';
    }

    positionIsBusy(x, y) {
        return this.placedSpaceProbes.find(item => item[0] === x && item[1] === y);
    }

    findPath(currentPosition, positionToGo) {
        const topRightCorner: Coordinate = [
            this.plateauMeshCoordinates.limit.x,
            this.plateauMeshCoordinates.limit.y
        ];

        const origin: Coordinate = [
            currentPosition.heldIn.x,
            currentPosition.heldIn.y
        ]

        const destination: Coordinate = [
            positionToGo.x,
            positionToGo.y
        ]

        const greedyBestFirstSearch = new GreedyBestFirstSearch(
            this.placedSpaceProbes,
            topRightCorner,
            origin,
            destination
        )

        const bestPath = greedyBestFirstSearch.search();
        
        if(bestPath) {
            currentPosition.heldIn = {};
            currentPosition.unauthorizedMovement = 0;
        }
        return currentPosition;
    }

    processPosition(currentPosition, positionToGo) {
        if(currentPosition.unauthorizedMovement) {
            currentPosition = this.findPath(currentPosition, positionToGo)
        } else if(this.positionIsBusy(positionToGo.x, positionToGo.y)) {
            currentPosition.heldIn = {
                x: currentPosition.x,
                y: currentPosition.y,
            };
            currentPosition.unauthorizedMovement++;
        }
        currentPosition.x = positionToGo.x;
        currentPosition.y = positionToGo.y;

        return currentPosition;
    }

    moveToEast(currentPosition) {
        if(currentPosition.x < this.plateauMeshCoordinates.limit.x) {
            const positionToGo = {x: currentPosition.x + 1, y: currentPosition.y};
            currentPosition = this.processPosition(currentPosition, positionToGo);
        }
        return currentPosition;
    }

    moveToWest(currentPosition) {
        if(currentPosition.x > this.plateauMeshCoordinates.initial.x) {
            const positionToGo = {x: currentPosition.x - 1, y: currentPosition.y};
            currentPosition = this.processPosition(currentPosition, positionToGo);
        }
        return currentPosition;
    }

    moveToNorth(currentPosition) {
        if(currentPosition.y < this.plateauMeshCoordinates.limit.y) {
            const positionToGo = {x: currentPosition.x, y: currentPosition.y + 1};
            currentPosition = this.processPosition(currentPosition, positionToGo);
        }
        return currentPosition;
    }

    moveToSouth(currentPosition) {
        if(currentPosition.y > this.plateauMeshCoordinates.initial.y) {
            const positionToGo = {x: currentPosition.x, y: currentPosition.y - 1};
            currentPosition = this.processPosition(currentPosition, positionToGo);
        }
        return currentPosition;
    }

    move(direction: string, currentPosition) {
        switch (direction.toUpperCase()) {
            case 'E':
                return this.moveToEast(currentPosition);
            case 'W':
                return this.moveToWest(currentPosition);
            case 'N':
                return this.moveToNorth(currentPosition);
            case 'S':
                return this.moveToSouth(currentPosition);
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
        const commands = instruction.commands;

        let cardinalDirection = instruction.initialPosition.cardinalDirection;
        let cardinalDirectionIndex = this.cardinalCoordinates.indexOf(cardinalDirection);
        
        let currentPosition = {
            x: instruction.initialPosition.x,
            y: instruction.initialPosition.y,
            cardinalDirection,
            unauthorizedMovement: 0,
            heldIn: {
                x: null,
                y: null
            }
        }
        
        commands.forEach(command => {
            command = command.toUpperCase();
            
            if(this.isToMove(command)) {
                currentPosition = this.move(cardinalDirection, currentPosition);
            } else if(this.isToRotate(command)) {
                cardinalDirectionIndex = this.rotate(command, cardinalDirectionIndex);
            }
            cardinalDirection = this.cardinalCoordinates[cardinalDirectionIndex]
            currentPosition.cardinalDirection = cardinalDirection;
            
        });
        const x = currentPosition.unauthorizedMovement > 0 ? currentPosition.heldIn?.x : currentPosition.x;
        const y = currentPosition.unauthorizedMovement > 0 ? currentPosition.heldIn?.y : currentPosition.y;

        this.placedSpaceProbes.push([x, y]);
        this.outputStream.write(`${x} ${y} ${cardinalDirection}\n`)
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
                const commands = this.getDirections(data);
                if(commands) {
                    this.entryInstruction.commands = commands;
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
    }
}