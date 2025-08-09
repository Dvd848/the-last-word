
import Game from './Game';
import {GameConfiguration} from '../../shared/src/SharedGame';
import { Player, PlayerType } from "../../shared/src/Player";
import { UserError } from "../../shared/src/SharedGame";
import { OnlineGame } from "./onlineGame";
import { initHomePage } from './Display';

/*
let defaultConfig : GameConfiguration = {
    playerDetails: [
        {name: "שחקן/ית א'", playerType: PlayerType.Human}, 
        {name: "מחשב", playerType: PlayerType.Human}
    ],
    checkDict: true
};
*/



function generateGameId(): string {
    return Math.random().toString(36).substring(2, 8);
}

function showGameUI() {
    const homeForm = document.getElementById("home-form");
    const gameUI = document.getElementById("game");

    if (homeForm) {
        homeForm.classList.add("d-none");
    }

    if (gameUI) {
        gameUI.classList.remove("d-none");
    }
}

function hideGameUI() {
    const homeForm = document.getElementById("home-form");
    const gameUI = document.getElementById("game");

    if (homeForm) {
        homeForm.classList.remove("d-none");
    }

    if (gameUI) {
        gameUI.classList.add("d-none");
    }
}

let onlineGame: OnlineGame | null = null;
function initGame() {

    document.addEventListener("DOMContentLoaded", async function() {
        //const dictionary = new Dictionary(DefaultLanguage);
        //await dictionary.init();
        console.log("DOMContentLoaded")
        onlineGame = new OnlineGame();
    });
}

// Check the URL on page load
const urlParts = window.location.pathname.split("/");
const gameIndex = urlParts.indexOf("game");

if (gameIndex !== -1 && gameIndex === urlParts.length - 2) {
    // If the URL is like /game/<game-id>, show the game UI and initialize the game
    showGameUI();
    initGame();
} else {
    // Otherwise, show the home page form
    hideGameUI();
    initHomePage();
}




