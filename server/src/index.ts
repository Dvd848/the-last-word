import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { onlineGameManager, createNewGame, checkGameId } from './onlineGameManager.js';
import cors from 'cors'; // Import cors
import Dictionary from './Dictionary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080; // Get port from env var, default to 8080

async function initializeServer() {
    const dictionary = new Dictionary();
    await dictionary.init(path.join(__dirname, '..', '..', 'server'));

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            // TODO: Is this really needed?
            origin: "*", // Allow requests from any origin
            methods: ["GET", "POST"], // Allow these HTTP methods
        }
    });
    
    app.use(cors()); // Enable CORS for all routes
    app.use(express.json());
    onlineGameManager(io, dictionary);

    createNewGame(dictionary, "test");

    app.post('/createGame', (req, res) => {
        try 
        {
            const gameId = createNewGame(dictionary, null);
            res.json({ gameId: gameId }); // Send the game ID back to the client
        } 
        catch (error) 
        {
            console.error("Error creating game:", error);
            res.status(500).json({ error: "Failed to create game" });
        }
    });

    app.post('/gameExists', (req, res) => {
        try 
        {
            const gameId = req.body.gameId; // Get the word from the request body
            if (!gameId) 
            {
                return res.status(400).json({ error: "gameId is required" });
            }

            const gameExists = checkGameId(gameId);

            res.json({ gameId: gameId, gameExists: gameExists });

        } 
        catch (error) 
        {
            console.error("Error checking gameId:", error);
            res.status(500).json({ error: "Failed to check gameId" });
        }
    });

    app.post('/checkWord', (req, res) => {
        try 
        {
            //console.log("checkWord", req.body)
            const word = req.body.word; // Get the word from the request body
            if (!word) 
            {
                return res.status(400).json({ error: "Word is required" });
            }

            const isValid = dictionary.contains(word); // Check the word using the dictionary

            console.log(`Checked word: ${word}, Is Valid: ${isValid}`);
            res.json({ word: word, isValid: isValid }); // Send the result back

        } 
        catch (error) 
        {
            console.error("Error checking word:", error);
            res.status(500).json({ error: "Failed to check word" });
        }
    });

    // Serve static files from the client directories
    app.use(express.static(path.join(__dirname, '../../client/public/')));

    // Catch-all route to serve index.html for SPA routing
    app.get('*', (req, res) => {
        console.log("request received");
        res.sendFile(path.join(__dirname, '../../client/public/index.html'));
    });

    server.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}

initializeServer();