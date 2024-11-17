import Unit from "./Unit.js";
import Painter from "./Painter.js";
import Battle from "./Battle.js";
import Shop from "./Shop.js";

export default class Player {
    static userId;
    static userHp;
    static userGold;
    static userUnits = [];

    static mapId;
    static stageId;
    static roundId;

    static init() {
        this.userId = window.challengeLog.user_id;
        this.userHp = window.challengeLog.hp_left;
        this.mapId = window.challengeLog.map_id;
        this.stageId = window.challengeLog.stage_id;
        this.roundId = window.challengeLog.round_id;

        this.getGoldAndUnitsFromSocket();
    }

    static getGoldAndUnitsFromSocket() {
        this.userGold = 100;
        this.userUnits = [];
    }

    static checkUnitToUpgrade(newUnit) {
        const sameUnits = this.userUnits.filter(unit => unit.unitId === newUnit.unitId && unit.star === newUnit.star);

        if (sameUnits.length >= 3) {
            const unitToUpgrade = sameUnits.find(unit => unit.inBattle) || sameUnits[0];
            unitToUpgrade.starUp();
            this.userUnits = this.userUnits.filter(unit => !sameUnits.includes(unit) || unit === unitToUpgrade);

            sameUnits.forEach(unit => {
                if (unit !== unitToUpgrade) {
                    Painter.removeUnitFromPainter(unit);
                    this.userUnits = this.userUnits.filter(u => u !== unit);
                }
            });

            Battle.removeUnits([sameUnits[1], sameUnits[2]]);

            this.checkUnitToUpgrade(unitToUpgrade);
        }
    }

    static purchaseUnit(data) {
        if (this.userGold >= 1) {
            const newUnit = new Unit(data, false);
            this.userUnits.push(newUnit);

            if (!Battle.addUnitToAllyQueue(newUnit)) {
                console.log(`Not enough space in the ally queue.`);

                return false;
            }

            Battle.userUnits.push(newUnit);
            newUnit.changeLocation(Battle.getFirstEmptyAllyQueueSpace(newUnit), 0);
            Painter.addUnitToPainter(newUnit);

            this.checkUnitToUpgrade(newUnit);
            Shop.removeUnit(newUnit);

            this.userGold -= 1;

            return true;
        } else {
            console.log(`Not enough gold to purchase.`);
            return false;
        }
    }

    static sellUnit(data) {
        console.log(data);

        const unitToSell = this.findUnitByIdx(data.idx);

        if(!unitToSell) return;

        Painter.removeUnitFromPainter(unitToSell);
        this.userGold += unitToSell.cost;
    }

    static findUnitByIdx(idx) { 
        return this.userUnits.find(unit => unit.idx === idx); 
    }
}
