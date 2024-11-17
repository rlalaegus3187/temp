import * as THREE from 'three';
import { THREE_CONSTS } from "./threeConsts.js";

class Character extends THREE.Sprite {
    constructor(unit) {
        const texturePath = `./img/unit_${unit.unitId}.png`;
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);
        const material = new THREE.SpriteMaterial({ map: texture });

        super(material);
        
        this.unit = unit;
    }

    setTexture(unit) {
        const texturePath = `./img/unit_${unit.id}.png`;
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(texturePath);
        this.material.map = texture;
        this.unit = unit;
    }
}

export default Character;
