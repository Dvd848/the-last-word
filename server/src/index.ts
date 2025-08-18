import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import { Server } from 'socket.io';
import { onlineGameManager, createNewGame, checkGameId } from './onlineGameManager.js';
import Dictionary from './Dictionary.js';
import rateLimit from 'express-rate-limit';
import { getStr, Strings } from '@shared/Strings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080; // Get port from env var, default to 8080

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 80, // limit each IP to 'max' requests per windowMs
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: getStr(Strings.TooManyRequests) }
});

app.use(apiLimiter)

async function initializeServer() {
    const dictionary = new Dictionary();
    const dictionaryBasePath = path.join(__dirname, '..');
    await dictionary.init(dictionaryBasePath);

    const server = http.createServer(app);
    const io = new Server(server);
    
    app.use(express.json());
    onlineGameManager(io, dictionary);

    //createNewGame(dictionary, "test");

    app.post('/createGame', apiLimiter, (req, res) => {
        try 
        {
            const gameId = createNewGame(dictionary, null);
            res.json({ gameId: gameId });
        } 
        catch (error) 
        {
            console.error("Error creating game:", error);
            let errorMessage = (error instanceof Error) ? error.message : "🤷‍♂️";
            res.status(500).json({ error: `${getStr(Strings.FailedToCreateGame)}: ${errorMessage}` });
        }
    });

    app.post('/gameExists', apiLimiter, (req, res) => {
        try 
        {
            const gameId = req.body.gameId;
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
            let errorMessage = (error instanceof Error) ? error.message : "🤷‍♂️";
            res.status(500).json({ error: `${getStr(Strings.FailedToCheckGameId)}: ${errorMessage}` });
        }
    });

    app.post('/checkWord', apiLimiter, (req, res) => {
        try 
        {
            //console.log("checkWord", req.body)
            const word = req.body.word;
            if (!word) 
            {
                return res.status(400).json({ error: "Word is required" });
            }

            const isValid = dictionary.contains(word);

            console.log(`Checked word: ${word}, Is Valid: ${isValid}`);
            res.json({ word: word, isValid: isValid });

        } 
        catch (error) 
        {
            console.error("Error checking word:", error);
            let errorMessage = (error instanceof Error) ? error.message : "🤷‍♂️";
            res.status(500).json({ error: `${getStr(Strings.FailedToCheckWord)}: ${errorMessage}` });
        }
    });

    // Serve static files from the client directories
    app.use(express.static(path.join(__dirname, '../../client/public/')));

    // Only serve index.html for known SPA routes (e.g., '/', '/game/:id')
    app.get(['/', '/game/:id'], (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/public/index.html'));
    });

    // 404 handler for all other routes
    app.use((req, res) => {
        console.log(`404 Not Found: ${req.originalUrl}`);
        res.status(404).json({ error: "Not found" });
    });

    server.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}

initializeServer();