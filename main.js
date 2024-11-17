import Painter from "./Painter.js";
import Unit from "./Unit.js";
import Battle from "./Battle.js";
import Player from "./Player.js";
import Round from "./Round.js";
import Shop from "./Shop.js";

window.onload = () => {
    init();
};

async function init() {    
    [Painter, Battle, Player, Round, Shop].forEach((module) => {
        module.init();
    });
}


