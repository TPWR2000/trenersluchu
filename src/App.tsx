import {useState} from 'react'
import {setSequenceGap} from './audio/engine'
import {ChordSettings} from './components/ChordSettings'
import {InfoPage} from './components/InfoPage'
import {QuizArea} from './components/QuizArea'
import {ResultsArea} from './components/ResultsArea'
import {SessionSettings} from './components/SessionSettings'
import {SettingsPage} from './components/SettingsPage'
import {type AppView, TopBar} from './components/TopBar'
import {TriadSettings} from './components/TriadSettings'
import {useSession} from './hooks/useSession'
import {useTheme} from './hooks/useTheme'

function App() {
    const session = useSession()
    const {isDark, toggleTheme} = useTheme()
    const [view, setView] = useState<AppView>('trainer')

    if (session.phase === 'running') {
        return (
            <div className="flex min-h-dvh flex-col bg-mt-bg font-sans text-mt-text">
                <QuizArea
                    config={session.config}
                    question={session.question}
                    answerOptions={session.answerOptions}
                    correctKey={session.correctKey}
                    feedback={session.feedback}
                    correct={session.correct}
                    wrong={session.wrong}
                    answered={session.answered}
                    timeLeft={session.timeLeft}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                    onAnswer={session.answer}
                    onRepeat={session.repeat}
                    onQuit={session.quit}
                />
            </div>
        )
    }

    return (
        <div className="flex min-h-dvh flex-col items-center bg-mt-bg px-4 py-5 font-sans text-mt-text sm:px-6 sm:py-8">
            <div className="flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
                <TopBar
                    config={session.config}
                    locked={session.phase !== 'setup'}
                    showTrainerControls={view === 'trainer' && session.phase === 'setup'}
                    view={view}
                    isDark={isDark}
                    onToggleTheme={toggleTheme}
                    onSelectView={setView}
                    onSelectCategory={session.setCategory}
                    onSelectCount={session.setCount}
                    onSelectTime={session.setSeconds}
                    onSelectDirection={session.setDirection}
                />

                {view === 'trainer' && session.phase === 'setup' && (
                    <>
                        {session.config.category === 'intervals' && (
                            <SessionSettings
                                selected={session.selectedIntervals}
                                samplesStatus={session.samplesStatus}
                                onToggle={session.toggleInterval}
                                onSelectAll={session.selectAllIntervals}
                                onClear={session.clearIntervals}
                                onStart={session.start}
                            />
                        )}
                        {session.config.category === 'triads' && (
                            <TriadSettings
                                selectedTriads={session.selectedTriads}
                                samplesStatus={session.samplesStatus}
                                onToggleCombination={session.toggleTriadCombination}
                                onToggleType={session.toggleTriadType}
                                onStart={session.start}
                            />
                        )}
                        {session.config.category === 'chords' && (
                            <ChordSettings
                                selectedChords={session.selectedChords}
                                samplesStatus={session.samplesStatus}
                                onToggleCombination={session.toggleChordCombination}
                                onToggleType={session.toggleChordType}
                                onStart={session.start}
                            />
                        )}
                    </>
                )}

                {view === 'trainer' && session.phase === 'results' && (
                    <ResultsArea
                        config={session.config}
                        correct={session.correct}
                        wrong={session.wrong}
                        history={session.history}
                        onNewSession={session.goToSetup}
                        onReplayTask={session.replayTask}
                    />
                )}
                {view === 'settings' && (
                    <SettingsPage
                        onApplyDefaults={session.applyDefaults}
                        onSequenceGapChange={setSequenceGap}
                    />
                )}
                {view === 'info' && <InfoPage/>}
            </div>
        </div>
    )
}

export default App
