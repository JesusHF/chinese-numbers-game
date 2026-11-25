import React, { useState } from 'react';
import { GameSettings, Question, UserAnswerResult, DEFAULT_RANGES_BY_DIFFICULTY } from './types/game';
import { generateQuestion } from './modes';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';

type ScreenState = 'setup' | 'playing' | 'results';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('setup');
  const [settings, setSettings] = useState<GameSettings>({
    numberType: 'classic',
    difficulty: 'easy',
    range: DEFAULT_RANGES_BY_DIFFICULTY.easy,
    dateOptions: {
      includeYears: false,
    },
    totalQuestions: 10,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState<UserAnswerResult[]>([]);

  const handleStartGame = () => {
    // Generate full question batch based on active settings
    const newQuestions: Question[] = [];
    for (let i = 0; i < settings.totalQuestions; i++) {
      newQuestions.push(generateQuestion(settings));
    }

    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setResults([]);
    setScreen('playing');
  };

  const handleAnswerSubmitted = (result: UserAnswerResult) => {
    setResults((prev) => [...prev, result]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setScreen('results');
    }
  };

  const handleQuit = () => {
    setScreen('setup');
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 flex flex-col justify-center">
        {screen === 'setup' && (
          <SetupScreen
            settings={settings}
            onUpdateSettings={setSettings}
            onStartGame={handleStartGame}
          />
        )}

        {screen === 'playing' && questions.length > 0 && (
          <GameScreen
            settings={settings}
            question={questions[currentQuestionIndex]}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onAnswerSubmitted={handleAnswerSubmitted}
            onNextQuestion={handleNextQuestion}
            onQuit={handleQuit}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            settings={settings}
            results={results}
            onPlayAgain={handleStartGame}
            onChangeSettings={() => setScreen('setup')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
