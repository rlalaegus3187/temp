import Game from "./Game.js";
import Painter from "./Painter.js";
import Player from "./Player.js";
import Unit from "./Unit.js";
import { THREE_CONSTS } from "./threeConsts.js";

//배틀을 관리하는 클래스. 
//전투 라운드인 경우 해당 클래스를 생성한다.

class Battle {
    static board = [];
    static allyQueue = [];
    static enemyUnits = [];
    static userUnits = [];
    static battleUnits = [];
    static battleTickInterval = 100;
    
    static isBattleActive = false;

    static init() {
        this.resetBoard();
        this.setupEventListeners();
    }

    static resetBoard() {
        this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.allyQueue = new Array(8).fill(null);
        this.enemyUnits = [];
        this.userUnits = [];
        this.battleUnits = [];
    }

    static setupEventListeners() {
        const battleStartButton = document.getElementById("battle_start");

        if (battleStartButton) {
            battleStartButton.addEventListener("click", () => {
                console.log("Battle start clicked");
                this.prepareBattle();
                this.startBattle();
            });
        } else {
            console.error("Battle start button not found!");
        }
    }

    static getCharacterByUid(uid) {
        for (const row of this.board) {
            for (const character of row) {
                if (character && character.uid === uid) {
                    return character;
                }
            }
        }
        return null;
    }

    static searchUnitByIdx(idx) {
        for (let x = 0; x < this.board.length; x++) {
            for (let y = 0; y < this.board[x].length; y++) {
                if (this.board[x][y] && this.board[x][y].idx === idx) {
                    return { character: this.board[x][y], location: "board", coords: { x, y } };
                }
            }
        }

        for (let i = 0; i < this.allyQueue.length; i++) {
            if (this.allyQueue[i] && this.allyQueue[i].idx === idx) {
                return { character: this.allyQueue[i], location: "queue", coords: { x: i } };
            }
        }

        return null;
    }

    static prepareBattle() {
        this.enemyUnits = [];
        this.userUnits = [];
        this.battleUnits = [];
        this.isBattleActive = true;  // 전투 시작 시 활성화

        this.board.flat().forEach((character) => {
            if (character) {
                character.inBattle = true;
                character.mp = 0;
                this.battleUnits.push(character);

                if (character.isEnemy) this.enemyUnits.push(character);

                else this.userUnits.push(character);
            }
        });

        this.allyQueue.forEach((character) => {
            if (character) character.inBattle = false;
        });

        console.log("Battle prepared");
    }

    static getFirstEmptyAllyQueueSpace() {
        for (let i = 0; i < this.allyQueue.length; i++) {
            if (this.allyQueue[i] === null) {
                return i;
            }
        }
        return -1;
    }

    static addUnitToBoard(unit) {
        this.board[unit.x][unit.y] = unit;
    }

    static updateUnitPosition(idx, locationType, coords) {
        const result = this.searchUnitByIdx(idx);
        if (!result) {
            console.log("Unit not found.");
            return;
        }

        const { character, location, coords: oldCoords } = result;

        const target = locationType === "board" ? this.board[coords.x][coords.y] : this.allyQueue[coords.x];
        if (target) {
            console.log("Target position is already occupied.");
            return;
        }

        if (locationType === "board") {
            this.board[coords.x][coords.y] = character;
        } else if (locationType === "queue") {
            this.allyQueue[coords.x] = character;
        }

        if (location === "board") {
            this.board[oldCoords.x][oldCoords.y] = null;
        } else if (location === "queue") {
            this.allyQueue[oldCoords.x] = null;
        }

        character.changeLocation(coords.x, coords.y);
    }

    static addUnitToAllyQueue(unit) {
        const emptySlotIndex = this.allyQueue.findIndex((slot) => slot === null);
        if (emptySlotIndex === -1) return false;
        this.allyQueue[emptySlotIndex] = unit;
        return true;
    }

    static removeUnits(units) {
        units.forEach((unit) => {
            this.board.forEach((row) => row.forEach((cell, idx) => {
                if (cell === unit) row[idx] = null;
            }));
            this.allyQueue = this.allyQueue.map((ally) => (ally === unit ? null : ally));
        });
    }

    static attack(attacker, target) {
        if (!this.isBattleActive) return;  // 전투가 종료되면 행동을 멈춤
        if (!attacker || !target) return;

        const damage = this.calculateDamage(attacker, target);
        console.log(damage);
        target.updateHp(Math.max(0, target.hp - damage));

        if (target.hp <= 0) this.die(target);
    }

    static calculateDamage(attacker, target) {
        let damage = 0;

        //여기서 버프랑 이후 스탯들 관리하면 될것 같습니다.

        damage = attacker.atk / 10;

        return damage;
    }

    static die(character) {
        if (!character) return;

        console.log('캐릭터 죽음');
        console.log(character);

        character.die();
        this.board[character.y][character.x] = null;

        const targetArray = character.isEnemy ? this.enemyUnits : this.userUnits;
        const index = targetArray.findIndex((unit) => unit.uid === character.uid);
        if (index !== -1) targetArray.splice(index, 1);

        this.checkBattleEnd();
    }

    static move(character, target) {
        if (!this.isBattleActive) return;  // 전투가 종료되면 행동을 멈춤
        if (!character) return;

        console.log(`캐릭터는 ${character.uid} 이동하려고 한다 : (${target.x}, ${target.y}).`);

        // 현재 위치에서 이동할 다음 칸만 찾기
        const [nextX, nextY] = this.findNextStep(character, target);
        if (nextX === undefined || nextY === undefined) {
            console.log("No valid next step found.");
            return;
        }

        // 이동 처리
        character.move(nextX, nextY);

        this.board[character.y][character.x] = null;
        character.x = nextX;
        character.y = nextY;
        this.board[nextY][nextX] = character;

        console.log(`캐릭터 ${character.uid}는 여기로 이동했음 : (${nextX}, ${nextY}).`);
    }

    static findNextStep(character, target) {
        const startX = Number(character.x);
        const startY = Number(character.y);
        const targetX = Number(target.x);
        const targetY = Number(target.y);

        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        console.log(`캐릭터 ${character.uid} 시작위치: (${startX}, ${startY}) 목적지: (${targetX}, ${targetY}).`);

        const distance = Math.abs(targetX - startX) + Math.abs(targetY - startY);

        if (distance === 1) {
            console.log(`타겟위치 (${targetX}, ${targetY}) 는 1칸 내외 입니다. 그럼 이동할 필요 없음.`);
            return [startX, startY];
        }

        // 현재 위치에서 이동 가능한 다음 칸 찾기
        const isValidPosition = (x, y) => {
            x = Number(x);
            y = Number(y);

            const isWithinBounds = x >= 0 && x < this.board[0].length && y >= 0 && y < this.board.length;
            const isEmpty = isWithinBounds && this.board[y][x] === null;
            return isWithinBounds && isEmpty;
        };

        // 이동할 수 있는 가장 가까운 칸 찾기 (우선순위: 목표로 가까운 방향)
        const closestDirection = directions
            .map(({ x: dx, y: dy }) => ({ x: startX + dx, y: startY + dy, dx, dy }))
            .filter(({ x, y }) => isValidPosition(x, y))
            .sort((a, b) => {
                const distanceA = Math.abs(a.x - targetX) + Math.abs(a.y - targetY);
                const distanceB = Math.abs(b.x - targetX) + Math.abs(b.y - targetY);
                return distanceA - distanceB;
            });

        // 가장 가까운 방향을 선택하고, 그 칸으로 이동
        if (closestDirection.length > 0) {
            const { x, y } = closestDirection[0];
            console.log(`Next step is to (${x}, ${y}).`);
            return [x, y];
        }

        // 이동할 수 없으면 null 반환
        console.log(`No valid next step found.`);
        return [undefined, undefined];
    }

    static findNearestEnemy(character) {
        const units = character.isEnemy ? this.userUnits : this.enemyUnits;
        
        let nearest = null;
        let minDistance = Infinity;

        units.forEach((unit) => {
            const distance = Math.abs(unit.x - character.x) + Math.abs(unit.y - character.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = unit;
            }
        });

        return nearest;
    }

    static async moveAsync(attacker, target) {
        if (!this.isBattleActive || attacker.hp <= 0) return;

        return new Promise((resolve) => {
            const moveDuration = 1000; // 속도에 맞춰 이동 시간 결정
            // const moveDuration = 10000 / character.spdMove; // 속도에 맞춰 이동 시간 결정

            setTimeout(() => {
                this.move(attacker, target);
                resolve();
            }, moveDuration); // 이동 속도에 맞춰 대기 시간
        });
    }

    static async attackAsync(attacker, target) {
        if (!this.isBattleActive || attacker.hp <= 0) return;

        return new Promise((resolve) => {
            const attackDuration = 2000; // 속도에 맞춰 이동 시간 결정

            // const attackDuration = 10000 / attacker.spdAtk; // 속도에 맞춰 공격 시간 결정
            console.log(`캐릭터 ${attacker.uid} 공격 함.  공격속도: ${attackDuration}ms`);

            setTimeout(() => {
                this.attack(attacker, target);
                resolve();
            }, attackDuration); // 공격 속도에 맞춰 대기 시간
        });
    }

    static async decideAction(character) {
        if (!this.isBattleActive || character.hp <= 0) return;

        if (!character.target || character.target.hp <= 0){
            character.target = this.findNearestEnemy(character);
        }
    
        const distance = Math.abs(character.target.x - character.x) + Math.abs(character.target.y - character.y);
    
        if (distance <= character.rangeAtk) {
            console.log(`캐릭터 ${character.uid} 는 적 ${character.target.uid} 을 공격합니다. 사거리: ${distance}.`);

            await this.attackAsync(character, character.target);
        } else {
            console.log(`캐릭터 ${character.uid} 는 이동합니다. 사거리: ${distance}.`);

            await this.moveAsync(character, character.target);
        }

        this.decideAction(character);
    }    

    static startBattle() {
        console.log("배틀 준비 시작.");

        this.prepareBattle();

        console.log("배틀 준비 완료.");

        // 각 캐릭터의 행동을 비동기적으로 처리
        for (const character of this.battleUnits) {
            console.log(`캐릭터 ${character.uid} 의 행동을 결정:`);
            this.decideAction(character);
        }
    }

    static checkBattleEnd() {
        if (this.enemyUnits.length === 0) {
            console.log("내 승리!");
            this.endBattle(); // 승리 후 전투 종료
        }
        if (this.userUnits.length === 0) {
            console.log("적 승리!");
            this.endBattle(); // 패배 후 전투 종료
        }
    }

    static endBattle() {
        this.isBattleActive = false;  // 전투 중지
        console.log("배틀 종료.");
        // 필요시, UI 업데이트 등을 처리할 수 있습니다.
    }
}

export default Battle;
