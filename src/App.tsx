import { ResultsArea } from './components/ResultsArea'
import { QuizArea } from './components/QuizArea'
import { SessionSettings } from './components/SessionSettings'
import { TopBar } from './components/TopBar'
import { useSession } from './hooks/useSession'

function App() {
  const session = useSession()

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8 font-mono text-mt-text">
      <div className="flex w-full max-w-3xl flex-col gap-10">
        <TopBar
          config={session.config}
          locked={session.phase === 'running'}
          onSelectCount={session.setCount}
          onSelectTime={session.setSeconds}
          onSelectDirection={session.setDirection}
        />

        {session.phase === 'setup' && (
          <SessionSettings
            config={session.config}
            selected={session.selected}
            samplesStatus={session.samplesStatus}
            onToggle={session.toggleInterval}
            onStart={session.start}
          />
        )}

        {session.phase === 'running' && (
          <QuizArea
            config={session.config}
            question={session.question}
            feedback={session.feedback}
            selected={session.selected}
            correct={session.correct}
            wrong={session.wrong}
            answered={session.answered}
            timeLeft={session.timeLeft}
            onAnswer={session.answer}
            onRepeat={session.repeat}
          />
        )}

        {session.phase === 'results' && (
          <ResultsArea
            config={session.config}
            correct={session.correct}
            wrong={session.wrong}
            onRestart={session.restart}
            onGoToSetup={session.goToSetup}
          />
        )}
      </div>
    </div>
  )
}

export default App
