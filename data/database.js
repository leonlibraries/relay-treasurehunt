/**********************
 * 一个简单的Mock数据库
 */
// Model types
export class Game {
}
export class HidingSpot {
}

// Mock data
var game = new Game();
game.id = '1';

/**
 * 九个盒子中有一个盒子有宝物,随机模拟
 * @type {Array}
 */
var hidingSpots = [];
(function () {
    var hidingSpot;
    var indexOfSpotWithTreasure = Math.floor(Math.random() * 9);
    for (var i = 0; i < 9; i++) {
        hidingSpot = new HidingSpot();
        hidingSpot.id = `${i}`;
        hidingSpot.hasTreasure = (i === indexOfSpotWithTreasure);
        hidingSpot.hasBeenChecked = false;
        hidingSpots.push(hidingSpot);
    }
})();

/**
 * 尝试次数
 * @type {number}
 */
var turnsRemaining = 3;

/**
 * 根据ID来探查隐藏宝物的方法
 * @param id
 */
export function checkHidingSpotForTreasure(id) {
    if (hidingSpots.some(hs => hs.hasTreasure && hs.hasBeenChecked)) {
        return;
    }
    turnsRemaining--;
    var hidingSpot = getHidingSpot(id);
    hidingSpot.hasBeenChecked = true;
};
export function getHidingSpot(id) {
    return hidingSpots.find(hs => hs.id === id)
}
export function getGame() {
    return game;
}
export function getHidingSpots() {
    return hidingSpots;
}
export function getTurnsRemaining() {
    return turnsRemaining;
}