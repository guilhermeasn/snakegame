// @ts-check

/**
 * @author Guilherme Neves <guilhermeasn@yahoo.com.br>
 */

/**
 * @type { Array<{x:number;y:number}> }
*/
const snakeDefault = [
    { x: 4, y: 0 }, // head
    { x: 3, y: 0 }, // body
    { x: 2, y: 0 }, // body
    { x: 1, y: 0 }, // body
    { x: 0, y: 0 }  // body
];
let snake = snakeDefault;

/**
 * @type { number }
 * 
 * - 1 => top
 * - 2 => right
 * - 3 => bottom
 * - 4 => left
 */
let direction = 2;

/** @type { boolean } */
let changedDirection = false;

/** 
 * @type { Array<Array<(0|1|2|3)>> }
 * 
 * - 0 => empty
 * - 1 => body
 * - 2 => head
 * - 3 => food
*/
let pixels = [];

/** @type { {x:number;y:number} | null } */
let food = null;

/** @type { number | null } */
let intervalControl = null;

/** @type { boolean } */
let gameEnd = false;

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function addFood(frameSize) {

    frameSize--;

    if(pixels.filter(p => p.some(v => v === 0)).length === 0) {
        return null;
    }

    while(true) {

        const y = getRandom(0, frameSize);
        const x = getRandom(0, frameSize);

        if(pixels[y][x] === 0) {
            return { y, x };
        }

    }

}

function snakeMove(frameSize) {

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
            x: newPos.x < 0 ? frameSize - 1 : newPos.x < frameSize ? newPos.x : 0,
            y: newPos.y < 0 ? frameSize - 1 : newPos.y < frameSize ? newPos.y : 0,
        };

    });

}

function evaluate() {

    const head = snake[0];
    
    if(snake.slice(1).some(body => body.y === head.y && body.x === head.x)) {
        gameEnd = true;
    }

    if(food && food.y === head.y && food.x === head.x) {

        food = null;
        snake.push(head);

        const score = (snake.length - snakeDefault.length) * 10;
        const scoreElement = document.getElementById('score');
        const maxScoreElement = document.getElementById('maxscore');

        if(scoreElement) scoreElement.innerHTML = score.toLocaleString();

        if(score > parseInt(localStorage.getItem('csg-maxscore') ?? '0')) {
            localStorage.setItem('csg-maxscore', score.toString());
            if(maxScoreElement) maxScoreElement.innerHTML = score.toLocaleString();
        }
        
    }

}

function calculatePixels() {

    // @ts-ignore
    const size = parseInt(document.getElementById('size')?.value ?? '10');

    if(pixels && intervalControl) {
        snakeMove(size);
        evaluate()
        if(!food) food = addFood(size);
    }

    pixels = [];

    for(let y = 0; y < size; y++) {

        pixels[y] = new Array();

        for(let x = 0; x < size; x++) {

            const i = snake.findIndex(pos => pos.x === x && pos.y === y);
            pixels[y][x] = i === 0 ? 2 : i > 0 ? 1 : 0;
            
            if(food && food.y === y && food.x === x) pixels[y][x] = 3;
            
        }

    }

}

function frameRender() {

    calculatePixels();

    const frameElement = document.getElementById('frame');

    if(!frameElement) throw new Error('Frame Element not found!');
    frameElement.innerHTML = '';

    if(frameElement.classList.contains('gameEnd')) {
        frameElement.classList.remove('gameEnd');
    }

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

    if(gameEnd) {
        frameElement.classList.add('gameEnd');
        stop();
    }

    changedDirection = false;

}

function start() {

    // @ts-ignore
    const timeout = parseInt(document.getElementById('speed')?.value ?? '1000');

    if(intervalControl) stop();
    else frameRender();

    const sizeElement = document.getElementById('size');
    if(sizeElement) sizeElement.setAttribute('disabled', 'disabled');

    if(gameEnd) reset();

    intervalControl = setInterval(frameRender, timeout);
}

function stop() {

    const sizeElement = document.getElementById('size');
    if(sizeElement) sizeElement.removeAttribute('disabled');

    if(intervalControl) clearInterval(intervalControl);
    intervalControl = null;

}

function reset() {
    gameEnd = false;
    snake = snakeDefault;
    direction = 2
    food = null;
    frameRender();
}

function loadScore() {

    const scoreElement = document.getElementById('score');
    const maxScoreElement = document.getElementById('maxscore');

    if(scoreElement) scoreElement.innerHTML = '0';
    if(maxScoreElement) maxScoreElement.innerHTML = localStorage.getItem('csg-maxscore') ?? '0';

    frameRender();

}

/** @type { (action: 'T' | 'B' | 'L' | 'R' | 'S') => void } */
function dispatch(action) {
    
    const last = direction;

    switch(action) {

        case 'T': direction = (direction !== 3 && intervalControl && !changedDirection) ? 1 : 3; break;
        case 'R': direction = (direction !== 4 && intervalControl && !changedDirection) ? 2 : 4; break;
        case 'B': direction = (direction !== 1 && intervalControl && !changedDirection) ? 3 : 1; break;
        case 'L': direction = (direction !== 2 && intervalControl && !changedDirection) ? 4 : 2; break;

        case 'S': intervalControl ? stop() : start(); break;

    }

    changedDirection = last !== direction;

}

document.addEventListener("keydown", event => {

    switch(event.code) {

        case 'ArrowUp':    case 'KeyW': dispatch('T'); break;
        case 'ArrowRight': case 'KeyD': dispatch('R'); break;
        case 'ArrowDown':  case 'KeyS': dispatch('B'); break;
        case 'ArrowLeft':  case 'KeyA': dispatch('L'); break;

        case 'Space': dispatch('S'); break;

    }

});