import { ResultsArea } from './components/ResultsArea'
import { QuizArea } from './components/QuizArea'
import { SessionSettings } from './components/SessionSettings'
import { TopBar } from './components/TopBar'
import { useSession } from './hooks/useSession'

function App() {
  const session = useSession()

  if (session.phase === 'running') {
    return (
      <div className="flex min-h-dvh flex-col bg-mt-bg font-mono text-mt-text">
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
          onQuit={session.quit}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-6 font-mono text-mt-text sm:py-10">
      <div className="flex w-full max-w-3xl flex-col gap-8 sm:gap-10">
        {session.phase === 'setup' && (
          <>
            <TopBar
              config={session.config}
              locked={false}
              onSelectCount={session.setCount}
              onSelectTime={session.setSeconds}
              onSelectDirection={session.setDirection}
            />
            <SessionSettings
              config={session.config}
              selected={session.selected}
              samplesStatus={session.samplesStatus}
              onToggle={session.toggleInterval}
              onStart={session.start}
            />
          </>
        )}

        {session.phase === 'results' && (
          <ResultsArea
            config={session.config}
            correct={session.correct}
            wrong={session.wrong}
            history={session.history}
            onNewSession={session.goToSetup}
            onReplayTask={session.replayTask}
          />
        )}
      </div>
    </div>
  )
}

export default App
