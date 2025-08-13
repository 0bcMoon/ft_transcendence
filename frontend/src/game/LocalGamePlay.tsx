import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PongEngine } from './engine/PongEngine';
import { Ball, GameState } from './engine/types';
import { GAME_CONFIG } from './engine/constants';
import GameCanvas from './components/GameCanvas';
import PauseMenu from './components/PauseMenu';
import GameOver from './components/GameOver';
import Instructions from './components/Instructions';

const LocalGamePlay = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Game engine reference
    const engineRef = useRef<PongEngine | null>(null);

    // Animation frame reference
    const animationFrameRef = useRef<number | null>(null);

    // Get player names from route state
    const player1Name = location.state?.player1 || 'Player 1';
    const player2Name = location.state?.player2 || 'Player 2';

    // Game state for React rendering
    const [gameState, setGameState] = useState<GameState>({
        player1: player1Name,
        player2: player2Name,
        isGameOver: false,
        winner: null,
        scores: {
            player1: 0,
            player2: 0
        }
    });

    // Ball state for rendering
    const [ball, setBall] = useState<Ball>({
        position: { x: GAME_CONFIG.canvasWidth / 2, y: GAME_CONFIG.canvasHeight / 2 },
        size: 15,
        velocity: { x: 5, y: 3 }
    });

    // Paddle positions for rendering
    const [player1Y, setPlayer1Y] = useState((GAME_CONFIG.canvasHeight - 100) / 2);
    const [player2Y, setPlayer2Y] = useState((GAME_CONFIG.canvasHeight - 100) / 2);

    // Game UI state
    const [isPaused, setIsPaused] = useState(false);
    const [showPauseMenu, setShowPauseMenu] = useState(false);

    // Initialize the game
    useEffect(() => {
        // Create canvas and setup engine
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = GAME_CONFIG.canvasWidth;
        canvas.height = GAME_CONFIG.canvasHeight;

        // Create and store the engine
        engineRef.current = new PongEngine(player1Name, player2Name);

        // Setup keyboard listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Start the game loop
        startGameLoop();

        // Cleanup on unmount
        return () => {
            stopGameLoop();
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Handle key down events
    const handleKeyDown = (e: KeyboardEvent) => {
        const engine = engineRef.current;
        if (!engine) return;

        if (e.key === 'Escape') {
            togglePauseMenu();
            return;
        }

        if (isPaused || gameState.isGameOver) return;

        switch (e.key.toLowerCase()) {
            case 'w':
                engine.setKeyState('w', true);
                break;
            case 's':
                engine.setKeyState('s', true);
                break;
            case 'arrowup':
                engine.setKeyState('arrowUp', true);
                break;
            case 'arrowdown':
                engine.setKeyState('arrowDown', true);
                break;
        }
    };

    // Handle key up events
    const handleKeyUp = (e: KeyboardEvent) => {
        const engine = engineRef.current;
        if (!engine) return;

        switch (e.key.toLowerCase()) {
            case 'w':
                engine.setKeyState('w', false);
                break;
            case 's':
                engine.setKeyState('s', false);
                break;
            case 'arrowup':
                engine.setKeyState('arrowUp', false);
                break;
            case 'arrowdown':
                engine.setKeyState('arrowDown', false);
                break;
        }
    };

    // Toggle pause menu
    const togglePauseMenu = () => {
        if (gameState.isGameOver) return;

        const newPausedState = !isPaused;
        setIsPaused(newPausedState);
        setShowPauseMenu(!showPauseMenu);

        if (newPausedState) {
            stopGameLoop();
        } else {
            startGameLoop();
        }
    };

    // Start the game loop
    const startGameLoop = () => {
        if (!engineRef.current) return;

        stopGameLoop();

        const gameLoop = () => {
            const engine = engineRef.current;
            if (!engine) return;

            // Update game state
            engine.update();

            // Get updated state for rendering
            const updatedGameState = engine.getGameState();
            const updatedBall = engine.getBall();
            const paddles = engine.getPaddles();

            // Update React state if game state has changed
            if (JSON.stringify(updatedGameState) !== JSON.stringify(gameState)) {
                setGameState(updatedGameState);
            }

            // Update visual elements
            setBall(updatedBall);
            setPlayer1Y(paddles.player1.position.y);
            setPlayer2Y(paddles.player2.position.y);

            // Continue the loop if not game over
            if (!updatedGameState.isGameOver) {
                animationFrameRef.current = requestAnimationFrame(gameLoop);
            }
        };

        // Start the loop
        animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Stop the game loop
    const stopGameLoop = () => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    // Resume the game
    const resumeGame = () => {
        if (gameState.isGameOver) return;

        setIsPaused(false);
        setShowPauseMenu(false);
        startGameLoop();
    };

    // Play again with same players - FIXED VERSION
    const playAgain = () => {
        if (!engineRef.current) return;

        // Reset engine state
        engineRef.current.reset();

        // Reset React state
        const freshGameState = engineRef.current.getGameState();
        setGameState(freshGameState);

        // Reset UI state
        setIsPaused(false);
        setShowPauseMenu(false);

        // Reset paddles and ball position for immediate visual feedback
        const paddles = engineRef.current.getPaddles();
        const updatedBall = engineRef.current.getBall();
        setBall(updatedBall);
        setPlayer1Y(paddles.player1.position.y);
        setPlayer2Y(paddles.player2.position.y);

        // Make sure we have a clean start by stopping any existing loop
        stopGameLoop();

        // Start a fresh game loop after a short delay to ensure React has updated
        setTimeout(() => {
            startGameLoop();
        }, 0);
    };

    // Go to main menu
    const goToMainMenu = () => {
        navigate('/game');
    };

    // Change players
    const changePlayers = () => {
        navigate('/game/local');
    };

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Game Canvas */}
            <GameCanvas
                canvasRef={canvasRef}
                ball={ball}
                player1Y={player1Y}
                player2Y={player2Y}
                paddleWidth={15}
                paddleHeight={100}
                gameState={gameState}
            />

            {gameState.isGameOver && (
                <GameOver
                    gameState={gameState}
                    onPlayAgain={playAgain}
                    onMainMenu={goToMainMenu}
                    onChangePlayers={changePlayers}
                />
            )}

            {showPauseMenu && !gameState.isGameOver && (
                <PauseMenu
                    gameState={gameState}
                    onResume={resumeGame}
                    onQuit={goToMainMenu}
                />
            )}

            <Instructions />
        </div>
    );
};

export default LocalGamePlay;
