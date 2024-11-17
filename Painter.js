import * as THREE from 'three';
import { OutlineEffect } from "three/addons/effects/OutlineEffect.js";
import { THREE_CONSTS } from "./threeConsts.js";

import Character from './Character.js';
import Battle from './Battle.js';
import Player from './Player.js';

export default class Painter {
    static board = new Array(8).fill(null).map(() => new Array(8).fill(null));
    static enemyQueue = new Array(8).fill(null);
    static allyQueue = new Array(8).fill(null);
    static draggingObject = null;
    static isDragging = false;
    static textures = {};
    static running = false;

    static init() {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, THREE_CONSTS.PLATE_RADIUS * 12, -(THREE_CONSTS.PLATE_RADIUS * 8));
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        //빛
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10).normalize();
        this.scene.add(directionalLight);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.id = "scene";

        const fieldInfoElement = document.getElementById("field_info");
        fieldInfoElement.appendChild(this.renderer.domElement);

        this.outlineEffect = new OutlineEffect(Painter.renderer);

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        window.addEventListener("resize", onResize);
        this.renderer.domElement.addEventListener("pointerdown", onPointerDown);
        this.renderer.domElement.addEventListener("pointermove", onPointerMove);
        this.renderer.domElement.addEventListener("pointerup", onPointerUp);
        this.renderer.domElement.addEventListener("dragover", onDragOver);
        this.renderer.domElement.addEventListener("drop", onDrop);

        this.drawBoard();
        this.startRender();
    }

    static drawBoard() {
        // 좌표용 바닥 (floor)
        const floorGeometry = new THREE.PlaneGeometry(
            THREE_CONSTS.PLATE_RADIUS * 50,
            THREE_CONSTS.PLATE_RADIUS * 50
        );
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
        });

        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotateX(Math.PI / 2);
        floor.position.set(0, 0, 0);
        floor.visible = false;
        floor.name = "floor";
        this.scene.add(floor);


        // 보드 (board)
        let plateGeometry = new THREE.BoxGeometry(
            THREE_CONSTS.PLATE_RADIUS,
            THREE_CONSTS.PLATE_HEIGHT,
            THREE_CONSTS.PLATE_RADIUS
        );

        THREE_CONSTS.COORDINATES.BOARD.forEach((row, i) => {
            row.forEach((coord, j) => {
                let color;
                let name;
                if (j < 4) {
                    color = 0xffffff;
                    name = "allyPlate";
                } else {
                    color = 0x808080;
                    name = "enemyPlate";
                }

                let material = new THREE.MeshLambertMaterial({ color });

                const plate = new THREE.Mesh(plateGeometry, material);
                plate.position.set(coord[0], coord[1], coord[2]);
                plate.boardCoords = {
                    y: i,
                    x: j,
                };
                plate.name = name;
                this.scene.add(plate);
            });
        });

        // 대기열 (queue)
        const boxGeometry = new THREE.BoxGeometry(
            THREE_CONSTS.BOX_WIDTH,
            THREE_CONSTS.BOX_HEIGHT,
            THREE_CONSTS.BOX_DEPTH
        );

        let queueMaterial = new THREE.MeshLambertMaterial({
            color: 0xffc0cb, // 연분홍색
        });

        THREE_CONSTS.COORDINATES.ALLY_QUEUE.forEach((coord, i) => {
            const cube = new THREE.Mesh(boxGeometry, queueMaterial);
            cube.translateX(coord[0]);
            cube.translateY(coord[1]);
            cube.translateZ(coord[2]);
            cube.name = "allyQueue";
            cube.boardCoords = {
                y: 6,
                x: i,
            };
            this.scene.add(cube);
        });


        // 상점 (shop) 
        const shopGeometry = new THREE.BoxGeometry(THREE_CONSTS.PLATE_RADIUS * 50, THREE_CONSTS.SHOP_HEIGHT, THREE_CONSTS.PLATE_RADIUS * 10);
        const shopMaterial = new THREE.MeshLambertMaterial({
            color: 0x0000ff, // 파란색 
        });
        const shop = new THREE.Mesh(shopGeometry, shopMaterial);
        shop.position.set(0, -THREE_CONSTS.BOX_HEIGHT - THREE_CONSTS.SHOP_HEIGHT / 2 - 1, 0);
        shop.name = "shop";
        this.scene.add(shop);
    }

    static addUnitToPainter(unit) {
        this.createUnitMesh(unit);
        this.drawUnit(unit);
    }

    static createUnitMesh(unit) {
        unit.mesh = new THREE.Group();
        unit.mesh.name = "unit";
        unit.mesh.idx = unit.idx;

        // 본체
        const bodyMesh = new Character(unit);

        bodyMesh.name = "unitBody";
        bodyMesh.unit = unit;
        bodyMesh.position.set(0, 0, 0);
        bodyMesh.scale.set(THREE_CONSTS.SPRITE_WIDTH, THREE_CONSTS.SPRITE_HEIGHT, 1);
        unit.mesh.add(bodyMesh);

        // Load textures for HP and MP bars
        const textureLoader = new THREE.TextureLoader();
        const hpTexture = textureLoader.load('./img/hp_bar.png');
        const mpTexture = textureLoader.load('./img/mp_bar.png');

        // HP bar
        const healthBarY = THREE_CONSTS.SPRITE_HEIGHT;
        const healthBarMaterial = new THREE.SpriteMaterial({ map: hpTexture });
        const healthBarSprite = new THREE.Sprite(healthBarMaterial);
        healthBarSprite.name = "healthBar";
        healthBarSprite.position.set(0, 0, healthBarY);
        healthBarSprite.scale.set(THREE_CONSTS.HEALTHBAR_WIDTH, THREE_CONSTS.HEALTHBAR_HEIGHT, 1);
        unit.mesh.add(healthBarSprite);

        // MP bar
        const manaBarY = healthBarY - THREE_CONSTS.HEALTHBAR_HEIGHT;
        const manaBarMaterial = new THREE.SpriteMaterial({ map: mpTexture });
        const manaBarSprite = new THREE.Sprite(manaBarMaterial);
        manaBarSprite.name = "manaBar";
        manaBarSprite.position.set(0, 0, manaBarY);
        manaBarSprite.scale.set(THREE_CONSTS.MANABAR_WIDTH, THREE_CONSTS.MANABAR_HEIGHT, 1);
        unit.mesh.add(manaBarSprite);
    }

    static drawUnit(unit) {
        const coords = unit.inBattle
            ? getBoardCoords(unit.x, unit.y)
            : getQueueCoords(unit.x);

        unit.mesh.position.set(
            coords[0],
            coords[1] +
            (THREE_CONSTS.SPRITE_HEIGHT + THREE_CONSTS.PLATE_HEIGHT) / 2,
            coords[2]
        );

        unit.mesh.boardCoords = { x: unit.x, y: unit.y };

        this.scene.add(unit.mesh);
    }

    static removeUnitFromPainter(unit) {
        if (unit.mesh) {
            this.scene.remove(unit.mesh);
            unit.mesh = null;
        }
    }

    static startRender() {
        if (!this.running) {
            this.running = true;
            this.animate();
        }
    }

    static animate() {
        if (!Painter.running) return;
        requestAnimationFrame(Painter.animate);
        const dt = Painter.clock.getDelta();
        Painter.outlineEffect.render(Painter.scene, Painter.camera);
    }
}

function getBoardCoords(x, z) {
    const coord = THREE_CONSTS.COORDINATES.BOARD[z][x];
    return [
        coord[0],
        coord[1],
        coord[2],
    ];
}

function getQueueCoords(x) {
    const coord = THREE_CONSTS.COORDINATES.ALLY_QUEUE[x];
    return [
        coord[0],
        coord[1],
        coord[2],
    ];
}

function onResize() {
    Painter.camera.aspect = window.innerWidth / window.innerHeight;
    Painter.camera.updateProjectionMatrix();
    Painter.renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerDown(event) {
    Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    Painter.dragStart = Painter.mouse.clone();

    const unitObject = getRaycastedUnitObject();

    if (unitObject) {
        Painter.isDragging = true;
        Painter.draggingObject = unitObject;
        Painter.draggingObject.initialPosition = unitObject.position.clone();
    }
}

function onPointerMove(event) {
    Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (!Painter.isDragging) {
        return;
    }

    Painter.raycaster.setFromCamera(Painter.mouse, Painter.camera);
    const intersects = Painter.raycaster.intersectObjects(Painter.scene.children);

    if (intersects.length > 0) {
        const intersect = intersects.find(i => i.object.name === "floor");

        if (intersect) {
            Painter.draggingObject.position.set(
                intersect.point.x,
                intersect.point.y,
                intersect.point.z
            );
        }
    }
}

function onPointerUp(event) {
    Painter.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    Painter.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // click 판정
    if (
        Painter.mouse.x <= Painter.dragStart.x + 0.1 &&
        Painter.mouse.x >= Painter.dragStart.x - 0.1 &&
        Painter.mouse.y <= Painter.dragStart.y + 0.1 &&
        Painter.mouse.y >= Painter.dragStart.y - 0.1
    ) {
        // onPointerClick(event);
    }

    if (!Painter.isDragging) return;

    const intersects = Painter.raycaster.intersectObjects(Painter.scene.children);
    const intersect = intersects.find(i => i.object.name === "allyPlate" || i.object.name === "allyQueue" || i.object.name === "shop");

    if (!intersect) {
        cancelDragging();
    } else {
        if (intersect.object.name === "allyPlate") {
            updateUnitPosition(Painter.draggingObject, "board", intersect.object.boardCoords);
        } else if (intersect.object.name === "allyQueue") {
            updateUnitPosition(Painter.draggingObject, "queue", intersect.object.boardCoords);
        } else if (intersect.object.name === "shop") {
            Player.sellUnit(Painter.draggingObject);
        }
    }

    Painter.draggingObject = null;
    Painter.isDragging = false;
}

function updateUnitPosition(unit, locationType, newCoords) {
    if (unit) {
        Battle.updateUnitPosition(unit.idx, locationType, newCoords);

        if (locationType === "board") {
            const coords = getBoardCoords(newCoords.x, newCoords.y);

            unit.position.set(
                coords[0],
                coords[1] +
                (THREE_CONSTS.SPRITE_HEIGHT + THREE_CONSTS.PLATE_HEIGHT) / 2,
                coords[2]
            );
        } else if (locationType === "queue") {
            const coords = getQueueCoords(newCoords.x);

            unit.position.set(
                coords[0],
                coords[1] +
                (THREE_CONSTS.SPRITE_HEIGHT + THREE_CONSTS.PLATE_HEIGHT) / 2,
                coords[2]
            );
        }
    }
}

function cancelDragging() {
    if (!Painter.isDragging) return;

    Painter.isDragging = false;

    Painter.draggingObject.position.copy(Painter.draggingObject.initialPosition);
    Painter.draggingObject = null;
}

function onDragOver(event) {
    event.preventDefault();
}

function onDrop(event) {
    event.preventDefault();
}

function getRaycastedUnitObject() {
    Painter.raycaster.setFromCamera(Painter.mouse, Painter.camera);

    const intersects = Painter.raycaster.intersectObjects(
        Painter.scene.children
    );

    for (let i = 0; i < intersects.length; ++i) {
        const object = intersects[i].object;
        if (object.parent.name === "unit") return object.parent;
    }
    return null;
}