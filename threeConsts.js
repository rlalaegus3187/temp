const PLATE_RADIUS = 4;
const PLATE_WIDTH = PLATE_RADIUS;
const PLATE_DEPTH = PLATE_RADIUS;
const PLATE_HEIGHT = PLATE_RADIUS / 20;
const PLATE_GAP = PLATE_RADIUS / 18;

const BOX_WIDTH = PLATE_RADIUS;
const BOX_DEPTH = PLATE_RADIUS;
const BOX_HEIGHT = PLATE_HEIGHT;
const BOX_GAP = BOX_WIDTH / 18;

const SHOP_WIDTH = PLATE_RADIUS;
const SHOP_HEIGHT = PLATE_RADIUS / 3;

const SPRITE_WIDTH = 3; 
const SPRITE_HEIGHT = 5;

const HEALTHBAR_WIDTH = PLATE_RADIUS - 1;
const HEALTHBAR_HEIGHT = PLATE_RADIUS / 5;
const HEALTHBAR_DEPTH = PLATE_RADIUS / 30;

const MANABAR_WIDTH = HEALTHBAR_WIDTH;
const MANABAR_HEIGHT = HEALTHBAR_HEIGHT;
const MANABAR_DEPTH = PLATE_RADIUS / 30;

const STATS_GAP = 5;
const ITEM_WIDTH = HEALTHBAR_WIDTH / 3 - STATS_GAP;
const ITEM_DEPTH = HEALTHBAR_HEIGHT / 10;

const COORDINATES = {
    BOARD: [],
    ALLY_QUEUE: [],
};

for (let i = 7; i >= 0; i--) {
    COORDINATES.BOARD.push([]);
    for (let j = 7; j >= 0; j--) {
        const coord = [0, 0, 0];
        coord[0] = j * (PLATE_WIDTH + PLATE_GAP) - (8 * (PLATE_WIDTH + PLATE_GAP)) / 2;
        coord[1] = -PLATE_HEIGHT / 2;
        coord[2] = i * (PLATE_DEPTH + PLATE_GAP) - (8 * (PLATE_DEPTH + PLATE_GAP)) / 2;
        COORDINATES.BOARD[7 - i].push(coord);
    }
}

for (let i = 7; i >= 0; i--) {
    const coord = [0, 0, 0];
    coord[0] = i * (BOX_WIDTH + BOX_GAP) - (8 * (BOX_WIDTH + BOX_GAP)) / 2;
    coord[1] = -BOX_HEIGHT / 2;
    coord[2] = -1 * ((PLATE_DEPTH + PLATE_GAP) * 4 + BOX_DEPTH / 4 + PLATE_DEPTH);
    COORDINATES.ALLY_QUEUE.push(coord);
}

const THREE_CONSTS = {
    COORDINATES,
    PLATE_RADIUS,
    PLATE_WIDTH,
    PLATE_HEIGHT,
    PLATE_DEPTH,
    BOX_WIDTH,
    BOX_DEPTH,
    BOX_HEIGHT,
    SHOP_WIDTH,
    SHOP_HEIGHT,
    SPRITE_WIDTH,
    SPRITE_HEIGHT,
    HEALTHBAR_WIDTH,
    HEALTHBAR_HEIGHT,
    HEALTHBAR_DEPTH,
    MANABAR_WIDTH,
    MANABAR_HEIGHT,
    MANABAR_DEPTH,
    ITEM_WIDTH,
    ITEM_DEPTH,
    STATS_GAP,
};

export { THREE_CONSTS };
