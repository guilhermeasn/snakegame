// @ts-check

/**
 * @type { Array<{x:number;y:number> }
*/
let snake = [
    { x: 3, y: 0 },
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
];

/**
 * @type { number }
 * 
 * - 1 => top
 * - 2 => right
 * - 3 => bottom
 * - 4 => left
 */
let direction = 2;

/** 
 * @type { Array<Array<(0|1|2|3)>> }
 * 
 * - 0 => empty
 * - 1 => body
 * - 2 => head
 * - 3 => food
*/
let pixels = [];

let intervalControl = 0;

function frameRender() {

    // @ts-ignore
    const size = parseInt(document.getElementById('size')?.value ?? '10');
    const frameElement = document.getElementById('frame');

    if(!frameElement) throw new Error('Frame Element not found!');

    pixels = [];

    for(let y = 0; y < size; y++) {

        pixels[y] = new Array();

        for(let x = 0; x < size; x++) {

            const i = snake.findIndex(pos => pos.x === x && pos.y === y);
            pixels[y][x] = i === 0 ? 2 : i > 0 ? 1 : 0;
            
        }

    }

    frameElement.innerHTML = '';

    pixels.forEach(row => {

        const rowElement = document.createElement('div');
        rowElement.classList.add('row');

        row.forEach(pixel => {

            const pixelElement = document.createElement('div');

            switch(pixel) {
                case 1:  pixelElement.classList.add('pixel', 'filled'); break;
                case 2:  pixelElement.classList.add('pixel', 'head');   break;
                case 3:  pixelElement.classList.add('pixel', 'food');   break;
                default: pixelElement.classList.add('pixel');
            }

            rowElement.append(pixelElement);

        });

        frameElement.append(rowElement);
    });

}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function addFood() {

    const size = pixels.length;

    while(true) {

        const y = getRandom(0, size - 1);
        const x = getRandom(0, size - 1);

        if(pixels[y][x] === 0) {
            pixels[y][x] = 3;
            break;
        }

    }

}

function snakeMove() {

    const size = pixels.length;
    let last;

    snake = snake.map(pos => {

        let newPos = last;

        if(!last) switch(direction) {
            case 1: newPos = { x: pos.x, y: pos.y - 1 }; break;
            case 2: newPos = { x: pos.x + 1, y: pos.y }; break;
            case 3: newPos = { x: pos.x, y: pos.y + 1 }; break;
            case 4: newPos = { x: pos.x - 1, y: pos.y }; break;
        }

        last = pos;

        return {
            x: newPos.x < 0 ? size - 1 : newPos.x < size ? newPos.x : 0,
            y: newPos.y < 0 ? size - 1 : newPos.y < size ? newPos.y : 0,
        };

    });

}

function start() {

    // @ts-ignore
    const timeout = parseInt(document.getElementById('level')?.value ?? '1000');

    intervalControl = setInterval(() => {
        snakeMove();
        frameRender();
    }, timeout);
}

function stop() {
    clearInterval(intervalControl);
}
