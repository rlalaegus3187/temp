import { THREE_CONSTS } from "./threeConsts.js";

function getBoardCoords(x, z) {
    return [...THREE_CONSTS.COORDINATES.BOARD[z][x]];
    // switch (Game.state) {
    //     case GAME_STATES.ARRANGE:
    //         return [...THREE_CONSTS.COORDINATES.BOARD[z + 3][x]];
    //     case GAME_STATES.FINISH:
    //         return [...THREE_CONSTS.COORDINATES.BOARD[z + 3][x]];
    //     case GAME_STATES.BATTLE:
    //         return Battle.reversed
    //             ? [...THREE_CONSTS.COORDINATES.BOARD[7 - z][7 - x]]
    //             : [...THREE_CONSTS.COORDINATES.BOARD[z][x]];
    //     case GAME_STATES.READY:
    //         return Battle.reversed
    //             ? [...THREE_CONSTS.COORDINATES.BOARD[5 - z][4 - x]]
    //             : [...THREE_CONSTS.COORDINATES.BOARD[z][x]];
    //     default:
    //         console.log("getBoardCoords: invalid state");
    //         return [0, 0, 0];
    // }
}

function getCookie(key) {
    let cookie = decodeURIComponent(document.cookie);
    let cookieArr = cookie.split("; ");
    let value = "";
    cookieArr.forEach((cookie) => {
        if (cookie.includes(key)) value = cookie.split("=")[1];
    });
    if (!value) return null;
    return value;
}

function getText(text) {
    return text[getCookie("lang") || "en"];
}

export { getBoardCoords, getCookie, getText };