import { OnlineGame, getGameId } from "./onlineGame";
import { initHomePage } from './Display';

/**
 * Shows the game UI by hiding the home UI.
 */
function showGameUI() 
{
    const homeForm = document.getElementById("home-form");
    const gameUI = document.getElementById("game");

    if (homeForm) 
    {
        homeForm.classList.add("d-none");
    }

    if (gameUI) 
    {
        gameUI.classList.remove("d-none");
    }
}

/**
 * Hides the game UI by displaying the home UI.
 */
function hideGameUI() 
{
    const homeForm = document.getElementById("home-form");
    const gameUI = document.getElementById("game");

    if (homeForm) 
    {
        homeForm.classList.remove("d-none");
    }

    if (gameUI) 
    {
        gameUI.classList.add("d-none");
    }
}

let onlineGame: OnlineGame | null = null;

/**
 * Initializes the OnlineGame instance when the DOM content is loaded.
 */
function initGame() 
{
    document.addEventListener("DOMContentLoaded", async function() 
    {
        onlineGame = new OnlineGame();
    });
}

/**
 * Determines which UI to show based on the current URL.
 * If the URL matches /game/<game-id>, shows the game UI and initializes the game.
 * Otherwise, shows the home UI.
 */
if (getGameId(window.location.href) != null) 
{
    // If the URL is like /game/<game-id>, show the game UI and initialize the game
    showGameUI();
    initGame();
} 
else 
{
    // Otherwise, show the home page form
    hideGameUI();
    initHomePage();
}




