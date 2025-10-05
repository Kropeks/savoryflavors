'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Clock, Zap, CheckCircle, Trophy, Award, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Food emojis for different difficulty levels
const FOOD_EMOJIS = {
  easy: ['🍕', '🍔', '🍟', '🌭', '🍿', '🍳', '🍗', '🍝', '🥨', '🥞', '🍱', '🍜'], // 12 unique emojis = 24 cards (6x4 grid)
  medium: ['🍕', '🍔', '🍟', '🌭', '🍿', '🍳', '🍗', '🍝', '🥨', '🥞', '🍱', '🍜', '🍙', '🍘', '🍥', '🍡', '🍢', '🍣'], // 18 unique emojis = 36 cards (6x6 grid)
  hard: ['🍕', '🍔', '🍟', '🌭', '🍿', '🍳', '🍗', '🍝', '🥨', '🥞', '🍱', '🍜', '🍙', '🍘', '🍥', '🍡', '🍢', '🍣', '🍤', '🍧', '🍨', '🍦', '🍰', '🎂', '🍮', '🍯', '🍬', '🍭', '🍫', '🍿', '🥟', '🥙'], // 32 unique emojis = 64 cards (8x8 grid)
};

const MemoryGame = ({ onClose, canRecord = false }) => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [solvedEmojis, setSolvedEmojis] = useState([]);
  const [moves, setMoves] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [showDifficultySelection, setShowDifficultySelection] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const timerRef = useRef(null);
  const flipTimeout = useRef(null);

  // Create a new shuffled deck of cards based on difficulty
  const createShuffledDeck = useCallback((difficulty = selectedDifficulty) => {
    // Get emojis for the selected difficulty
    const emojis = FOOD_EMOJIS[difficulty] || FOOD_EMOJIS.medium;

    // Create pairs of emojis and shuffle them
    const emojiPairs = [...emojis, ...emojis]; // This creates 2 of each emoji
    const shuffled = [...emojiPairs]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }));

    return shuffled;
  }, [selectedDifficulty]);

  // Load leaderboard from localStorage on component mount
  useEffect(() => {
    try {
      const savedLeaderboard = localStorage.getItem('memoryGameLeaderboard');
      if (savedLeaderboard) {
        const parsedLeaderboard = JSON.parse(savedLeaderboard);
        if (Array.isArray(parsedLeaderboard)) {
          setLeaderboard(parsedLeaderboard);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    }
  }, []);

  // Save score to leaderboard
  const saveScore = useCallback((name, moves, time) => {
    try {
      const newScore = { name, moves, time, date: new Date().toISOString() };
      const updatedLeaderboard = [...leaderboard, newScore]
        .sort((a, b) => {
          // Sort by moves first, then by time
          if (a.moves === b.moves) {
            return a.time - b.time;
          }
          return a.moves - b.moves;
        })
        .slice(0, 10); // Keep only top 10 scores

      setLeaderboard(updatedLeaderboard);
      localStorage.setItem('memoryGameLeaderboard', JSON.stringify(updatedLeaderboard));
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [leaderboard]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Initialize the game based on difficulty
  const initializeGame = useCallback((difficulty = selectedDifficulty) => {
    // Clear any existing timeouts
    if (flipTimeout.current) {
      clearTimeout(flipTimeout.current);
      flipTimeout.current = null;
    }

    // Stop any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset game state
    setTime(0);
    setAttempts(0);
    setMoves(0);
    setSolvedEmojis([]);
    setGameComplete(false);
    setFlippedIndices([]);
    setDisabled(true);

    // Create and set initial cards (all face up for preview)
    const initialCards = createShuffledDeck(difficulty).map(card => ({
      ...card,
      flipped: true // Start with all cards face up
    }));

    setCards(initialCards);

    // After 2 seconds, flip all cards face down and enable the game
    flipTimeout.current = setTimeout(() => {
      setCards(prevCards =>
        prevCards.map(card => ({
          ...card,
          flipped: false
        }))
      );
      setDisabled(false);
    }, 2000);

  }, [createShuffledDeck, selectedDifficulty]);

  // Handle game completion
  const handleGameComplete = useCallback(() => {
    setIsRunning(false);
    setGameComplete(true);
    // Only prompt for name/score submission if recording is allowed
    setShowNameInput(!!canRecord);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [canRecord]);

  // Submit score to leaderboard
  const handleSubmitScore = (e) => {
    e.preventDefault();
    // If recording is disabled (guest), do nothing
    if (!canRecord) return;
    if (playerName.trim()) {
      saveScore(playerName.trim(), moves, time);
      setShowNameInput(false);
    }
  };

  // Check if the selected cards match
  const checkForMatch = useCallback(() => {
    if (flippedIndices.length !== 2) return;

    const [firstIndex, secondIndex] = flippedIndices;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    // Always increment moves counter when checking a pair
    setMoves(prev => prev + 1);
    setDisabled(true);

    // If cards match
    if (firstCard.emoji === secondCard.emoji) {
      // Mark cards as matched
      setCards(prevCards =>
        prevCards.map((card, idx) =>
          idx === firstIndex || idx === secondIndex
            ? { ...card, matched: true, flipped: true }
            : card
        )
      );

      // Add to solved emojis
      setSolvedEmojis(prev => {
        const newSolved = [...prev, firstCard.emoji];

        // Check if game is complete
        const currentEmojis = FOOD_EMOJIS[selectedDifficulty] || FOOD_EMOJIS.medium;
        // Calculate pairs: each unique emoji creates one pair
        const totalPairs = currentEmojis.length;
        if (newSolved.length === totalPairs) {
          handleGameComplete();
        }

        return newSolved;
      });

      // Reset flipped indices and enable interaction
      setFlippedIndices([]);
      setDisabled(false);
    } else {
      // No match - increment attempts and flip cards back after 1 second
      setAttempts(prev => prev + 1);

      // Set a timeout to flip the cards back after 1 second
      flipTimeout.current = setTimeout(() => {
        setCards(prevCards =>
          prevCards.map((card, idx) =>
            idx === firstIndex || idx === secondIndex
              ? { ...card, flipped: false }
              : card
          )
        );
        setFlippedIndices([]);
        setDisabled(false);
      }, 1000);
    }
  }, [flippedIndices, cards, selectedDifficulty, handleGameComplete]);

  // Handle card click
  const handleCardClick = useCallback((index) => {
    // Don't allow clicking if:
    // - Game is disabled (during animations)
    // - Card is already flipped or matched
    // - Already have two cards flipped
    if (disabled || cards[index].flipped || cards[index].matched) {
      return;
    }
    
    // Start timer on first move
    if (!isRunning && flippedIndices.length === 0) {
      setIsRunning(true);
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    // Flip the card
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);
    
    // Update the card state to show it's flipped
    setCards(prevCards => 
      prevCards.map((card, idx) => 
        idx === index ? { ...card, flipped: true } : card
      )
    );
    
    // If this is the second card, check for a match
    if (newFlipped.length === 2) {
      checkForMatch();
    }
  }, [disabled, flippedIndices, cards, isRunning, time, checkForMatch]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    
    // Cleanup function
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flipTimeout.current) clearTimeout(flipTimeout.current);
    };
  }, [initializeGame]);
  
  // Update flipped cards when flippedIndices change
  useEffect(() => {
    if (flippedIndices.length === 2) {
      checkForMatch();
    }
  }, [flippedIndices, checkForMatch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-6 w-full max-w-7xl max-h-[95vh] sm:max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">

        {/* Main Menu */}
        <AnimatePresence mode="wait">
          {showMainMenu && (
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-8">
                <ChefHat className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Memory Game</h3>
                <p className="text-gray-600 dark:text-gray-300">Test your memory with delicious food emojis!</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <button
                  onClick={() => {
                    setShowMainMenu(false);
                    setShowDifficultySelection(true);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.445.832L12 11.202a1 1 0 000-1.664L9.555 7.168z" clipRule="evenodd" />
                  </svg>
                  Play Game
                </button>

                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Trophy className="w-6 h-6" />
                  Leaderboard
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-4 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <X className="w-6 h-6" />
                  Exit Game
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Difficulty Selection */}
        <AnimatePresence mode="wait">
          {showDifficultySelection && (
            <motion.div
              key="difficulty-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Difficulty</h3>
                <p className="text-gray-600 dark:text-gray-300">Select your challenge level</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-6">
                {/* Easy */}
                <button
                  onClick={() => {
                    setSelectedDifficulty('easy');
                    setShowDifficultySelection(false);
                    setShowMainMenu(false);
                    // Use setTimeout to ensure state updates are processed
                    setTimeout(() => initializeGame('easy'), 0);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedDifficulty === 'easy'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  <div className="text-4xl mb-3">🌟</div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Easy</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">12 pairs (24 cards)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">6×4 grid • Perfect for beginners</p>
                </button>

                {/* Medium */}
                <button
                  onClick={() => {
                    setSelectedDifficulty('medium');
                    setShowDifficultySelection(false);
                    setShowMainMenu(false);
                    setTimeout(() => initializeGame('medium'), 0);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedDifficulty === 'medium'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  <div className="text-4xl mb-3">⚡</div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Medium</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">18 pairs (36 cards)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">6×6 grid • Classic challenge</p>
                </button>

                {/* Hard */}
                <button
                  onClick={() => {
                    setSelectedDifficulty('hard');
                    setShowDifficultySelection(false);
                    setShowMainMenu(false);
                    setTimeout(() => initializeGame('hard'), 0);
                  }}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    selectedDifficulty === 'hard'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  <div className="text-4xl mb-3">🔥</div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Hard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">32 pairs (64 cards)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">8×8 grid • Ultimate challenge</p>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowDifficultySelection(false);
                  setShowMainMenu(true);
                }}
                className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game UI - Only show when not in menu */}
        {!showMainMenu && !showDifficultySelection && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 w-full max-w-none">
            {/* Mobile: Game Stats - Top (shown only on mobile) */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                <div className="text-xs text-gray-400 dark:text-gray-400">Time</div>
                <div className="flex items-center gap-1 text-lg font-semibold text-white">
                  <Clock className="w-4 h-4" />
                  {`${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`}
                </div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                <div className="text-xs text-gray-400 dark:text-gray-400">Moves</div>
                <div className="flex items-center gap-1 text-lg font-semibold text-white">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  {moves}
                </div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                <div className="text-xs text-gray-400 dark:text-gray-400">Matched</div>
                <div className="flex items-center gap-1 text-lg font-semibold text-white">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {solvedEmojis.length} / {selectedDifficulty === 'easy' ? 12 : selectedDifficulty === 'medium' ? 18 : 32}
                </div>
              </div>
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                <div className="text-xs text-gray-400 dark:text-gray-400">Accuracy</div>
                <div className="text-lg font-semibold text-white">
                  {attempts > 0 ? Math.round((solvedEmojis.length / attempts) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Left Sidebar - Game Controls (hidden on mobile, shown as collapsible on tablet) */}
            <div className="hidden lg:flex flex-col gap-4 min-w-[220px]">
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Game Controls</h3>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setGameComplete(false);
                      setShowMainMenu(true);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Main Menu
                  </button>
                  <button
                    onClick={() => {
                      setCards([]);
                      setFlippedIndices([]);
                      setSolvedEmojis([]);
                      setMoves(0);
                      setAttempts(0);
                      setGameComplete(false);
                      setTime(0);
                      setIsRunning(false);
                      setShowNameInput(false);
                      initializeGame(selectedDifficulty);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Game
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close Game
                  </button>
                </div>
              </div>

              {/* Game Counter */}
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Game Stats</h3>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  <div className="text-green-600 dark:text-green-400 font-bold text-lg">{moves}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-400">moves</div>
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-3">
                  <div className="text-green-600 dark:text-green-400 font-bold text-lg">{solvedEmojis.length} / {selectedDifficulty === 'easy' ? 12 : selectedDifficulty === 'medium' ? 18 : 32}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-400">pairs matched</div>
                </div>
              </div>
            </div>

            {/* Center - Game Board */}
            <div className="flex-1 min-w-0">
              {/* Desktop: Game Stats - Top (hidden on mobile) */}
              <div className="hidden lg:grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                  <div className="text-xs text-gray-400 dark:text-gray-400">Time</div>
                  <div className="flex items-center gap-1 text-lg font-semibold text-white">
                    <Clock className="w-4 h-4" />
                    {`${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`}
                  </div>
                </div>
                <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                  <div className="text-xs text-gray-400 dark:text-gray-400">Moves</div>
                  <div className="flex items-center gap-1 text-lg font-semibold text-white">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {moves}
                  </div>
                </div>
                <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                  <div className="text-xs text-gray-400 dark:text-gray-400">Matched</div>
                  <div className="flex items-center gap-1 text-lg font-semibold text-white">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {solvedEmojis.length} / {selectedDifficulty === 'easy' ? 12 : selectedDifficulty === 'medium' ? 18 : 32}
                  </div>
                </div>
                <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg">
                  <div className="text-xs text-gray-400 dark:text-gray-400">Accuracy</div>
                  <div className="text-lg font-semibold text-white">
                    {attempts > 0 ? Math.round((solvedEmojis.length / attempts) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Mobile: Game Controls - Collapsible */}
              <div className="lg:hidden mb-4">
                <details className="group">
                  <summary className="flex cursor-pointer items-center justify-between bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg text-white">
                    <span className="text-sm font-semibold">Game Controls</span>
                    <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-2 p-3 bg-white/5 dark:bg-gray-800/30 backdrop-blur-sm rounded-lg space-y-2">
                    <button
                      onClick={() => {
                        setGameComplete(false);
                        setShowMainMenu(true);
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Main Menu
                    </button>
                    <button
                      onClick={() => {
                        setCards([]);
                        setFlippedIndices([]);
                        setSolvedEmojis([]);
                        setMoves(0);
                        setAttempts(0);
                        setGameComplete(false);
                        setTime(0);
                        setIsRunning(false);
                        setShowNameInput(false);
                        initializeGame(selectedDifficulty);
                      }}
                      className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Game
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close Game
                    </button>
                  </div>
                </details>
              </div>

              {/* Game Board - Fixed width container */}
              <div className="w-[600px] max-w-full mx-auto my-3 sm:my-4">
                <div 
                  className={`grid gap-1.5 sm:gap-2 w-full`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${
                      selectedDifficulty === 'easy' ? 6 : 
                      selectedDifficulty === 'medium' ? 6 : 8
                    }, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${
                      selectedDifficulty === 'easy' ? 4 : 
                      selectedDifficulty === 'medium' ? 6 : 8
                    }, minmax(0, 1fr))`,
                    aspectRatio: selectedDifficulty === 'easy' ? '6/4' : '1/1',
                  width: '100%',
                  height: '100%'
                }}
              >
                {cards.map((card, index) => (
                  <AnimatePresence key={card.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        transition: { duration: 0.3 }
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.8,
                        transition: { duration: 0.2 }
                      }}
                      onClick={() => handleCardClick(index)}
                      className={`
                        relative cursor-pointer aspect-square rounded-lg overflow-hidden transition-all duration-150 hover:scale-105 touch-manipulation
                        ${card.matched ? 'opacity-0' : 'opacity-100'}
                        w-full h-full min-h-[40px] sm:min-h-[45px] md:min-h-[50px] lg:min-h-[55px]
                      `}
                    >
                      {/* Card Back (Chef Hat Logo) */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-2 border-green-100 dark:border-green-800/50"
                        initial={false}
                        animate={{
                          rotateY: card.flipped ? 180 : 0,
                          opacity: card.flipped ? 0 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChefHat className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-600 dark:text-green-400" />
                      </motion.div>

                      {/* Card Front (Emoji) */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800"
                        initial={false}
                        animate={{
                          rotateY: card.flipped ? 0 : 180,
                          opacity: card.flipped ? 1 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl select-none">{card.emoji}</span>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                ))}
              </div>
            </div>
            </div>

            {/* Right Sidebar - Additional Stats (hidden on mobile and tablet) */}
            <div className="hidden xl:flex flex-col gap-4 min-w-[220px]">
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Performance</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">Accuracy</div>
                    <div className="text-lg font-semibold text-white">
                      {attempts > 0 ? Math.round((solvedEmojis.length / attempts) * 100) : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">Attempts</div>
                    <div className="text-lg font-semibold text-white">{attempts}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">Time Elapsed</div>
                    <div className="text-lg font-semibold text-white">
                      {`${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Title */}
              <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="text-center">
                  <ChefHat className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">Memory Game</h3>
                  <p className="text-xs text-gray-300 mt-1">Food Emoji Challenge</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Name Input Modal - Shows when game is completed */}
        <AnimatePresence>
          {showNameInput && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNameInput(false)}
            >
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">🎉 Congratulations!</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">You completed the game!</p>
                </div>

                <div className="mb-4 sm:mb-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{moves}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Moves</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(time)}</div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Time</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {attempts > 0 ? Math.round((solvedEmojis.length / attempts) * 100) : 0}% Accuracy
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitScore} className="space-y-4">
                  <div>
                    <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter your name for the leaderboard:
                    </label>
                    <input
                      type="text"
                      id="playerName"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Your name..."
                      autoFocus
                      maxLength={20}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNameInput(false)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Skip
                    </button>
                    <button
                      type="submit"
                      disabled={!playerName.trim()}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                    >
                      Submit Score
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leaderboard Modal - Shows when leaderboard button is clicked */}
        <AnimatePresence>
          {showLeaderboard && showMainMenu && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboard(false)}
            >
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[85vh] shadow-2xl border border-gray-200 dark:border-gray-700"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                    Top Scores
                  </h3>
                  <button
                    onClick={() => setShowLeaderboard(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close leaderboard"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {leaderboard.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={`${entry.name}-${entry.date}`}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                              index === 0 ? 'bg-yellow-400 text-yellow-900' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                              index === 2 ? 'bg-amber-600 text-amber-100' :
                              'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{entry.name}</span>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right">
                            <div className="font-medium">{entry.moves} moves</div>
                            <div className="text-gray-500 dark:text-gray-400">{formatTime(entry.time)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                      <Trophy className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-base sm:text-lg font-medium">No scores yet</p>
                      <p className="text-xs sm:text-sm">Complete a game to appear on the leaderboard!</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                    {leaderboard.length > 0
                      ? `Showing ${Math.min(leaderboard.length, 10)} of ${leaderboard.length} top scores`
                      : 'Be the first to set a high score!'
                    }
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemoryGame;
