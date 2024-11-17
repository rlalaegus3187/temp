import * as THREE from "three";
import Painter from "./Painter.js";
import { THREE_CONSTS } from "./threeConsts.js";
import { getBoardCoords } from "./utils.js";

export default class Unit {
    static currentIdx = 0;

    constructor(data, isEnemy) {
        this.idx = Unit.currentIdx++;
        this.uid = Unit.currentIdx++;

        this.unitId = data.unit_id;
        this.unitName = data.unit_name;

        this.hp = data.hp;
        this.maxHp = data.hp;

        this.mp = data.mp;
        this.maxMp = data.mp;

        this.atk = data.atk;
        this.spAtk = data.sp_atk;
        this.def = data.def;
        this.spDef = data.sp_def;

        this.spdMove = data.spd_move /100 ; // 이동 속도
        this.spdAtk = data.spd_atk; // 공격 속도

        this.chanceCrit = data.chance_crit;
        this.rangeAtk = data.range_atk;

        this.skills = [data.skill_id_1, data.skill_id_2, data.skill_id_3];

        this.isEnemy = isEnemy;
        this.inBattle = isEnemy;

        this.x = data.location_x;
        this.y = data.location_y;

        this.targetIdx = null;

        this.star = 1;
        this.cost = 1;

        this.buffs = [];

        this.perminantStats = {
            hp: 0,
            atk: 0,
            def: 0,
            spAtk: 0,
            spDef: 0,
            spdMove: 0,
            spdAtk: 0,
        };

        this.temporaryStats = {
            hp: 0,
            atk: 0,
            def: 0,
            spAtk: 0,
            spDef: 0,
            spdMove: 0,
            spdAtk: 0,
        };

        this.mesh = null;
        Painter.createUnitMesh(this);
    }

    die() {
        console.log('character die');
        this.hp = 0;
        Painter.scene.remove(this.mesh);
    }

    changeLocation(newX, newY) {
        this.x = newX;
        this.y = newY;
    }

    starUp() {
        if (this.star >= 3) return;

        const multipliers = {
            2: { hp: 1.5, atk: 1.5, def: 1.2, spAtk: 1.5, spDef: 1.2, spdMove: 1.2, spdAtk: 1.3},
            3: { hp: 2.0, atk: 2.0, def: 1.5, spAtk: 1.5, spDef: 1.2, spdMove: 1.2, spdAtk: 1.3 },
        };

        const nextStar = this.star + 1;
        if (multipliers[nextStar]) {
            this.hp *= multipliers[nextStar].hp;
            this.maxHp *= multipliers[nextStar].hp;
            this.atk *= multipliers[nextStar].atk;
            this.def *= multipliers[nextStar].def;
            this.spAtk *= multipliers[nextStar].spAtk;
            this.spDef *= multipliers[nextStar].spDef;
            this.spdMove *= multipliers[nextStar].spdMove;
            this.spdAtk *= multipliers[nextStar].spdAtk;

            this.star = nextStar;

            this.cost += 1;
            console.log(`Unit ${this.unitName} upgraded to ${this.star} star!`);
        }
    }

    addBuff(buff) {
        this.buffs.push(buff);
    }

    removeBuff(buff) {
        this.buffs = this.buffs.filter(b => b !== buff);
    }

    updateHp(newHp) {
        this.hp = newHp < 0 ? 0 : newHp;

        const healthBarMesh = this.mesh.getObjectByName("healthBar");
        healthBarMesh.scale.x = this.hp / this.maxHp;
        healthBarMesh.position.x =
            ((1 - this.hp / this.maxHp) * THREE_CONSTS.HEALTHBAR_WIDTH) / 2;

        const damagedHealthMesh = this.mesh.getObjectByName("healthBar");

        function animateHealthDamage() {
            if (damagedHealthMesh.scale.x > healthBarMesh.scale.x) {
                damagedHealthMesh.scale.x -= 0.01;
                damagedHealthMesh.position.x =
                    ((1 - damagedHealthMesh.scale.x) *
                        THREE_CONSTS.HEALTHBAR_WIDTH) /
                    2;
                requestAnimationFrame(animateHealthDamage);
            } else {
                damagedHealthMesh.scale.x = healthBarMesh.scale.x;
                damagedHealthMesh.position.x =
                    ((1 - damagedHealthMesh.scale.x) *
                        THREE_CONSTS.HEALTHBAR_WIDTH) /
                    2;
            }
        }
        animateHealthDamage();
    }

    updateMp (newMp) {
        if (newMp < 0) newMp = 0;
        if (newMp > this.maxMp) newMp = this.maxMp;
        this.mp = newMp;
        // if (this.focused) document.getElementById("mp").innerHTML = this.mp;

        // const manaBarMesh = this.mesh.getObjectByName("manaBar");
        // manaBarMesh.scale.x = this.mp / this.maxMp;
        // manaBarMesh.position.x =
        //     ((1 - this.mp / this.maxMp) * THREE_CONSTS.MANABAR_WIDTH) / 2;
    }

    attack(target) {
        // 공격 속도를 반영하여 유닛이 공격하는 애니메이션을 조정합니다.
        const bodyMesh = this.mesh.getObjectByName("unitBody");
        bodyMesh.lookAt(target.mesh.position);

        // const duration = Math.round(12 / this.spdAtk);
        // let i = 0;
        // function animate() {
        //     if (i < duration / 2) bodyMesh.translateZ(0.2);
        //     else bodyMesh.translateZ(-0.2);
        //     if (++i < duration) requestAnimationFrame(animate);
        // }

        // animate();
    }

    move(nextX, nextY) {
        console.log('moving to next');

        const beforeCoords = getBoardCoords(this.x, this.y);
        const nextCoords = getBoardCoords(nextX, nextY);

        console.log(beforeCoords);
        console.log(nextCoords);

        // const nextLocation = new THREE.Vector3(...nextCoords);
        // const bodyMesh = this.mesh.getObjectByName("unitBody");
        
        // nextLocation.setY(
        //     new THREE.Box3()
        //         .setFromObject(bodyMesh)
        //         .getCenter(new THREE.Vector3()).y
        // );
        // bodyMesh.lookAt(nextLocation);

        const toMoveCoords = {
            x: nextCoords[0] - beforeCoords[0],
            z: nextCoords[2] - beforeCoords[2],
        };

        const durationToMove = 240 / this.spdMove;
        let i = 0;
        const animateMove = () => {
            if (++i > durationToMove) return;
            this.mesh.position.x += toMoveCoords.x / durationToMove;
            this.mesh.position.z += toMoveCoords.z / durationToMove;
            requestAnimationFrame(animateMove);

            console.log()
        };

        animateMove();
    }

    cast() {
        Painter.castEffect(this);
    }
}
