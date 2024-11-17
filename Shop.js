import Player from "./Player.js";

export default class Shop {
    static level = 1;
    static exp = 0;
    static shopUnitList;
    static shopList = [];

    static init() {
        this.shopUnitList = window.shopUnitList;

        if (!this.shopUnitList || this.shopUnitList.length === 0) {
            return;
        }

        this.shopList = this.getShopList();

        this.createShopUI();
    }

    static getShopList() {
        let completeList = [];
        for (let unit of this.shopUnitList) {
            for (let i = 0; i < 5; i++) {
                completeList.push(unit);
            }
        }

        return completeList;
    }
    
    static removeUnit(data) {

    }

    static refreshShop() {
        let shuffled = this.shopUnitList.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 5);
    }

    static purchaseExp() {
        if (Player.userGold >= 4) {
            Player.userGold -= 4;
            this.exp += 1;

            this.checkLevelUp();
        } else {
            console.log('Not enough gold to purchase exp.');
        }
    }

    static checkLevelUp() {
        const expToNextLevel = 10;

        if (this.exp >= expToNextLevel) {
            this.exp -= expToNextLevel;
            this.level += 1;
            console.log(`Level up! New level: ${this.level}`);
        }
    }

    static createShopUI() {
        this.refreshShop();

        const unitListElement = document.getElementById('unit_list');
        if (!unitListElement) {
            console.error('unit_list element not found');
            return;
        }

        unitListElement.innerHTML = '';

        this.shopList.forEach((unit, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${unit.unit_name} - 비용: ${unit.cost}`;
            listItem.setAttribute('data-var', index);

            const handleClick = () => {
                const purchaseSuccessful = Player.purchaseUnit(unit);
                if (purchaseSuccessful) {
                    listItem.textContent = ''; 
                    listItem.removeEventListener('click', handleClick); 
                }
            };

            listItem.addEventListener('click', handleClick);

            unitListElement.appendChild(listItem);
        });
    }

    static addEventListeners() {
        const rerollButton = document.getElementById('unit_roll');
        const levelUpButton = document.getElementById('level_up');

        if (rerollButton) {
            rerollButton.addEventListener('click', () => {
                if (Player.userGold >= 2) {
                    Player.userGold -= 2;
                    this.refreshShop();
                } else {
                    console.log('Not enough gold to reroll.');
                }
            });
        }

        if (levelUpButton) {
            levelUpButton.addEventListener('click', () => {
                this.purchaseExp();
            });
        }
    }
}
