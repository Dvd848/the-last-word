import * as Constants from './Constants';
import Dictionary from './Dictionary';
import Game, {GameConfiguration} from './Game';
import { PlayerType } from './Player';

let defaultConfig : GameConfiguration = {
    playerDetails: [
        {name: "שחקן/ית א'", playerType: PlayerType.Human}, 
        {name: "מחשב", playerType: PlayerType.Computer}
    ],
    checkDict: true
};

let game : Game;
document.addEventListener("DOMContentLoaded", async function() {
    const dictionary = new Dictionary(Constants.DefaultLanguage);
    await dictionary.init();

    game = new Game(defaultConfig, dictionary);
});
