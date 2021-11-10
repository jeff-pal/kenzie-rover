var stdin = process.stdin;
var stdout = process.stdout;
stdin.setRawMode( true );
stdin.setEncoding( 'utf8' );
let direction = 0;


class Navigation {
    currentDirectionIndex = 0;
    directions = [
        {
            icon: '▲',
            move: () => { 
                if(
                    this.coordinates.current.y <
                    this.coordinates.limits.y.max
                ) this.coordinates.current.y++ 
            }
        },
        {
            icon: '▶',
            move: () => { 
                if(
                    this.coordinates.current.x <
                    this.coordinates.limits.x.max
                ) this.coordinates.current.x++ 
            }
        },
        {
            icon: '▼',
            move: () => { 
                if(
                    this.coordinates.current.y >
                    this.coordinates.limits.y.min
                ) this.coordinates.current.y-- 
            }
        },
        {
            icon: '◀',
            move: () => { 
                if(
                    this.coordinates.current.x >
                    this.coordinates.limits.x.min
                ) this.coordinates.current.x-- 
            }
        }
    ]

    coordinates = {
        limits: {
            x: {
                min: 0,
                max: 0
            },
            y: {
                min: 0,
                max: 0
            }
        },
        current: {
            x: 0,
            y: 0
        },
    }

    constructor(maxX, maxY, initialX, initialY) {
        if(arguments.length < 4) {
            console.log('Navigation instance missing params!');
            process.exit(0);
        } 

        this.coordinates.limits.x.max = maxX;
        this.coordinates.limits.y.max = maxY;
        this.coordinates.current.x = initialX;
        this.coordinates.current.y = initialY;
    }

    direction() {
        return this.directions[this.currentDirectionIndex].icon + '\n' + `(${this.coordinates.current.x}, ${this.coordinates.current.y})`;
    }

    showDirectionAndPosition() {
        console.clear();
        console.log(this.direction());
        console.log("Use arrow keys and 'M' to move.");
    }

    right() {
        this.currentDirectionIndex = (this.currentDirectionIndex + 1) % this.directions.length;
    }

    left() {
        const lastDirectionIndex = this.directions.length - 1;
        const leftDirectionIndex = this.currentDirectionIndex - 1;
        this.currentDirectionIndex = this.currentDirectionIndex === 0 ? lastDirectionIndex : leftDirectionIndex;
    }
    move() {
        this.directions[this.currentDirectionIndex].move();
    }

}

function readData(key) {
    key = key.toString()

    switch (key) {
    case '\u001b[C':

        direction++;
        navigation.right();
        navigation.showDirectionAndPosition();
        break;
    case '\u001b[D':
        navigation.left();
        navigation.showDirectionAndPosition();
        break;
    case '\u006D':
        navigation.move();
        navigation.showDirectionAndPosition();
        break;
    case '\u0003':
        process.exit();
        break;
    default:
        break;
    }
}

const navigation = new Navigation(20, 20, 2, 4);
stdin.on('data', readData);
navigation.showDirectionAndPosition();