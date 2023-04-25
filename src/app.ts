import Game from "./Game";
import { PlayerType } from "./Player";

const game = new Game([
    {name: "שחקן/ית א'", type: PlayerType.Computer}, 
    {name: "שחקן/ית ב'", type: PlayerType.Computer}
]);
game.init();
game.start();