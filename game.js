/*
 * @Author: OriLight
 * @Date: 2022-04-26 20:14:53
 * @LastEditTime: 2022-05-09 19:39:51
 */
// Constant
CANVAS_SIZE = 600
CANVAS_BACKGROUND_COLOR = '#333333'
GAME_SIZE = 4
FONT_SIZE = 36
BLOCK_SIZE = 120
BLOCK_PADDING_SIZE = (CANVAS_SIZE - BLOCK_SIZE * GAME_SIZE) / (GAME_SIZE + 1)
BLOCK_BACKGROUND_COLOR = {
    2: '#eee4da',
    4: '#eee1c9',
    8: '#f3b27a',
    16: '#f69664',
    32: '#f77c5f',
    64: '#f75f3b',
    128: '#edd073',
    256: '#edcc62',
    512: '#edc950',
    1024: '#edc53f',
    2048: '#edc22e'
}
BLOCK_PLACEHOLDER_COLOR = '#555555'
FRAME_PRE_SECOND = 60
ANIMATION_DURATION = 0.15

// Util Functions
randInt = function (a, b) {
    return a + Math.floor(Math.random() * (b + 1 - a))
}

randChoice = function (arr) {
    return arr[randInt(0, arr.length - 1)]
}

// Model
class Game {
    constructor() {
        this.data = []
        this.initalizeData()
    }

    initalizeData() {
        this.data = []
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = []
            for (let j = 0; j < GAME_SIZE; j++) {
                tmp.push(null)
            }
            this.data.push(tmp)
        }
        this.generateNewBlock()
        this.generateNewBlock()
    }

    generateNewBlock() {
        let possiblePositions = []
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (this.data[i][j] == null) {
                    possiblePositions.push([i, j])
                }
            }
        }
        if (possiblePositions != 0) {
            let position = randChoice(possiblePositions)
            this.data[position[0]][position[1]] = 2
        }

    }

    // shiftBlock1(arr) {
    //     let i = 1;
    //     while (i < arr.length) {
    //         if (arr[i] == null) {
    //             i++
    //             continue
    //         }
    //         if (arr[i - 1] == null & i != 0) {
    //             arr[i - 1] = arr[i]
    //             arr[i] = null
    //             i--
    //             continue
    //         }
    //         if (arr[i] == arr[i - 1] & i != 0) {
    //             arr[i - 1] = arr[i - 1] * 2
    //             arr[i] = null
    //         }
    //         i++
    //     }
    //     return (arr)
    // }

    shiftBlock(arr, reverse = false) {
        let head = 0
        let tail = 1
        let incr = 1
        let moves = []
        if (reverse == true) {
            head = arr.length - 1
            tail = head - 1
            incr = -1
        }
        while (0 <= tail && tail < arr.length) {
            if (arr[tail] == null) {
                tail += incr
            } else {
                if (arr[head] == null) {
                    arr[head] = arr[tail]
                    arr[tail] = null
                    moves.push([tail, head])
                    tail += incr
                } else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2
                    arr[tail] = null
                    moves.push([tail, head])
                    head += incr
                    tail += incr
                } else {
                    head += incr
                    if (head == tail) {
                        tail += incr
                    }
                }
            }
        }
        return moves
    }

    advance(command) {
        let reverse = (command == 'right' || command == 'down')
        let moves = []
        if (command == 'left' || command == 'right') {
            for (let i = 0; i < GAME_SIZE; i++) {
                let rowMove = this.shiftBlock(this.data[i], reverse)
                for (let move of rowMove) {
                    moves.push([
                        [i, move[0]],
                        [i, move[1]]
                    ])
                }
            }
        } else if (command == 'up' || command == 'down') {
            for (let j = 0; j < GAME_SIZE; j++) {
                let tmp = []
                for (let i = 0; i < GAME_SIZE; i++) {
                    tmp.push(this.data[i][j])
                }
                let colMove = this.shiftBlock(tmp, reverse)
                for (let move of colMove) {
                    moves.push([
                        [move[0], j],
                        [move[1], j]
                    ])
                }
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i][j] = tmp[i]
                }
            }
        }
        if (moves.length != 0) {
            this.generateNewBlock()
        }
        return moves
    }
}

// Tests
class Test {
    static compareArray(arr1, arr2) {
        if (arr1.length != arr2.length) {
            return false
        }

        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] != arr2[i]) {
                return false
            }
        }
        return true
    }

    static test_shiftBlock() {
        let gameTest = new Game()
        let testCases = [
            [
                [2, 2, 2, 2],
                [4, 4, null, null]
            ],
            [
                [2, 2, null, 2],
                [4, 2, null, null]
            ],
            [
                [4, 2, null, 2],
                [4, 4, null, null]
            ],
            [
                [2, 4, null, 8],
                [2, 4, 8, null]
            ],
            [
                [null, null, null, null],
                [null, null, null, null]
            ],
            [
                [null, 4, 4, 8],
                [8, 8, null, null]
            ]
        ]
        let errFlag = false
        for (let test of testCases) {
            for (let reverse of [true, false]) {
                let input = test[0].slice()
                let result = test[1].slice()
                if (reverse == true) {
                    input.reverse()
                    result.reverse()
                }
                gameTest.shiftBlock(input, reverse)
                if (!Test.compareArray(input, result)) {
                    errFlag = true
                    console.log(test)
                    console.log('Fail')
                }
            }
        }
        if (!errFlag) {
            console.log('Pass')
        }
    }
}

// View
class View {
    constructor(game, container) {
        this.game = game
        this.blocks = []
        this.container = container
        this.initalizeContainer()
    }

    initalizeContainer() {
        this.container.style.width = `${CANVAS_SIZE}px`
        this.container.style.height = `${CANVAS_SIZE}px`
        this.container.style.backgroundColor = CANVAS_BACKGROUND_COLOR
        this.container.style.position = 'relative'
        this.container.style.display = 'inline-block'
        this.container.style.borderRadius = `15px`
        this.container.style.zIndex = 1
    }

    gridToPosition(i, j) {
        let top = i * (BLOCK_SIZE + BLOCK_PADDING_SIZE) + BLOCK_PADDING_SIZE
        let left = j * (BLOCK_SIZE + BLOCK_PADDING_SIZE) + BLOCK_PADDING_SIZE
        return [top, left]
    }

    animate(moves) {
        this.doFrame(moves, 0, ANIMATION_DURATION)
    }

    doFrame(moves, currTime, totolTime) {
        if (currTime < totolTime) {
            setTimeout(() => {
                this.doFrame(moves, currTime + 1 / FRAME_PRE_SECOND, totolTime)
            }, 1 / FRAME_PRE_SECOND * 1000)
            for (let move of moves) {
                let block = this.blocks[move[0][0]][move[0][1]]
                let origin = this.gridToPosition(move[0][0], move[0][1])
                let destination = this.gridToPosition(move[1][0], move[1][1])
                let currPos = [
                    origin[0] + currTime / totolTime * (destination[0] - origin[0]),
                    origin[1] + currTime / totolTime * (destination[1] - origin[1])
                ]
                block.style.top = `${currPos[0]}px`
                block.style.left = `${currPos[1]}px`
            }
        } else {
            view.drawGame()
        }
    }

    drawGame() {
        this.container.innerHTML = ''
        this.blocks = []
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = []
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR)
                if (this.game.data[i][j]) {
                    let block = this.drawBlock(i, j, this.game.data[i][j])
                    tmp.push(block)
                } else {
                    tmp.push(null)
                }
            }
            this.blocks.push(tmp)
        }
    }

    drawBackgroundBlock(i, j, color) {
        let block = document.createElement('div')
        block.style.width = `${BLOCK_SIZE}px`
        block.style.height = `${BLOCK_SIZE}px`
        block.style.backgroundColor = color
        block.style.position = 'absolute'
        block.style.top = `${i*(BLOCK_PADDING_SIZE+BLOCK_SIZE)+BLOCK_PADDING_SIZE}px`
        block.style.left = `${(j+1)*BLOCK_PADDING_SIZE+j * BLOCK_SIZE}px`
        block.style.borderRadius = `10px`
        block.style.zIndex = 3
        this.container.append(block)
        return block
    }

    drawBlock(i, j, number) {
        let span = document.createElement('span')
        let text = document.createTextNode(number)
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR[number])
        if (number >= 8) {
            span.style.color = '#fff'
        }
        span.style.fontSize = `${FONT_SIZE}px`
        span.style.lineHeight = `${BLOCK_SIZE}px`
        span.appendChild(text)
        block.zIndex = 5
        block.appendChild(span)
        return block
    }
}

// Controller
var container = document.getElementById('game-container')
var game = new Game()
var view = new View(game, container)
view.drawGame()

document.onkeydown = function (event) {
    let moves = []
    if (event.key == 'ArrowLeft') {
        moves = game.advance('left')
    } else if (event.key == 'ArrowRight') {
        moves = game.advance('right')
    } else if (event.key == 'ArrowUp') {
        moves = game.advance('up')
    } else if (event.key == 'ArrowDown') {
        moves = game.advance('down')
    }
    if (moves.length > 0) {
        view.animate(moves)
    }
}