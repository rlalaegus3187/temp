import Unit from "./Unit.js";
import Battle from "./Battle.js";
import Painter from "./Painter.js";

export default class Round {
    static roundId;
    static roundType;
    static roundData;
    static enemyUnits = [];

    static init() {
        this.roundId = window.currentRound.round_id;
        this.roundType = window.currentRound.round_type;
        this.roundData = window.roundData;

        this.seed = window.round_seed;
        
        this.organiseRoundData();
    }

    static organiseRoundData() {
        // 라운드 타입 별로 다른 종류의 데이터를 정리하기
        switch (this.roundType) {
            case '0': // 전투
                this.roundData.forEach(data => {
                    const enemyUnit = new Unit(data, true);

                    this.enemyUnits.push(enemyUnit); 
                    Painter.drawUnit(enemyUnit);
                    Battle.addUnitToBoard(enemyUnit);
                });
                break;
            case '1':
                break;
        }
    }
}