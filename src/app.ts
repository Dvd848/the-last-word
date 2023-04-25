import Game from "./Game";
import { PlayerType } from "./Player";

const game = new Game([
    {name: "שחקן/ית א'", playerType: PlayerType.Human}, 
    {name: "מחשב", playerType: PlayerType.Computer}
]);
game.init();
game.start();