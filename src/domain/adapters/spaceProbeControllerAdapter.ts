import SpaceProbeController from "../protocols/spaceProbeController";

function warn(text) {
    console.log(`\u001b[31m${text}`);
    process.stdout.write('\u001b[0m');
}

export default class SpaceProbeControllerAdapter implements SpaceProbeController{
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
    
    entrySpaceProbe = {
        name: null,
        initialPosition: null,
        directions: null
    }
    
    questionIndex = 0;
    
    spaceProbes = [];
    test:string;

    questions = [
        'Top Right Coordinate (x y): ',
        'Initial position (x y d): ',
        'Directions: '
    ];


    getInstructionsSequency: () => void;
    
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
        this.entrySpaceProbe.name = null;
        this.entrySpaceProbe.initialPosition = null;
        this.entrySpaceProbe.directions = null;
    }

    processIncomingInstruction(data:string) {
        console.clear();
        
        if(this.topRightCoordinateIsNotSet()) {
            const topRightCoordinate = this.getTopRightCoordinate(data);

            if(topRightCoordinate) {
                this.plateauMeshCoordinates.limit.x = topRightCoordinate.maxX;
                this.plateauMeshCoordinates.limit.y = topRightCoordinate.maxY;
                console.log(this.plateauMeshCoordinates);
                this.nexQuestion();
            }

        } else {
            if(this.entrySpaceProbe.name) {
                const directions = this.getDirections(data);
                if(directions) {
                    this.entrySpaceProbe.directions = directions;
                    this.spaceProbes.push(this.entrySpaceProbe);
                    console.log(this.spaceProbes);
                    this.clearEntrySpaceProbe();
                    this.nexQuestion();
                }
            } else {
                const spaceProbeInitialPosition = this.getSpaceProbeInitialPosition(data);
                if(spaceProbeInitialPosition) {
                    this.entrySpaceProbe.name = this.spaceProbes.length + 1;
                    this.entrySpaceProbe.initialPosition = spaceProbeInitialPosition;
                    this.nexQuestion();
                }
            }
        }
        console.log(this.questions[this.questionIndex]);
    }
}