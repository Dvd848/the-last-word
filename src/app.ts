import Game from "./Game";
import { PlayerType } from "./Player";

const game = new Game([
    {name: "שחקן/ית א'", playerType: PlayerType.Human}, 
    {name: "שחקן/ית ב'", playerType: PlayerType.Human}
]);
game.init();
game.start();