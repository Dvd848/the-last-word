import Dictionary from './Dictionary';
import Game, {GameConfiguration} from './Game';
import { PlayerType } from './Player';
import { DefaultLanguage } from './Strings';

let defaultConfig : GameConfiguration = {
    playerDetails: [
        {name: "שחקן/ית א'", playerType: PlayerType.Human}, 
        {name: "מחשב", playerType: PlayerType.ComputerNovice}
    ],
    checkDict: true
};

let game : Game;
document.addEventListener("DOMContentLoaded", async function() {
    const dictionary = new Dictionary(DefaultLanguage);
    await dictionary.init();

    game = new Game(defaultConfig, dictionary);
});
