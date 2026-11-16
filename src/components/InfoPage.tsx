const infoCardClass = 'rounded-2xl border border-mt-border bg-mt-sub-alt p-5'

export function InfoPage() {
    return (
        <section className="flex flex-col gap-6">
            <header>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-mt-accent">O aplikacji</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-mt-text">Informacje</h1>
                <p className="mt-2 text-sm text-mt-sub">Trener słuchu pomaga rozpoznawać interwały oraz budowę akordów
                    ze słuchu.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <article className={infoCardClass}>
                    <h2 className="font-semibold text-mt-text">Tryby sesji</h2>
                    <p className="mt-2 text-sm leading-6 text-mt-sub">
                        W trybie zadań rozwiązujesz wybraną liczbę pytań. W trybie czasowym odpowiadasz na jak najwięcej
                        pytań przed upływem czasu.
                    </p>
                </article>
                <article className={infoCardClass}>
                    <h2 className="font-semibold text-mt-text">Odtwarzanie</h2>
                    <p className="mt-2 text-sm leading-6 text-mt-sub">
                        Dźwięki mogą być grane kolejno w górę lub w dół, jednocześnie (harmonicznie) albo w losowym
                        kierunku dla każdego pytania.
                    </p>
                </article>
                <article className={infoCardClass}>
                    <h2 className="font-semibold text-mt-text">Moduły ćwiczeń</h2>
                    <dl className="mt-3 space-y-3 text-sm leading-6">
                        <div>
                            <dt className="font-medium text-mt-text">Interwały</dt>
                            <dd className="text-mt-sub">Od prymy czystej do oktawy; skróty pokazują nazwę lub liczbę
                                półtonów.
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-mt-text">Trójdźwięki</dt>
                            <dd className="text-mt-sub">Durowe, molowe, zmniejszone i zwiększone, w dostępnych
                                przewrotach.
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-mt-text">Czterodźwięki</dt>
                            <dd className="text-mt-sub">Akordy septymowe: durowe, molowe, dominantowe, półzmniejszone i
                                zmniejszone.
                            </dd>
                        </div>
                    </dl>
                </article>
                {/*<article className={infoCardClass}>*/}
                {/*    <h2 className="font-semibold text-mt-text">Technologia</h2>*/}
                {/*    <p className="mt-2 text-sm leading-6 text-mt-sub">*/}
                {/*        Wersja 0.0.0 · React + TypeScript · Tone.js. Brzmienie fortepianu zapewniają lokalne sample*/}
                {/*        Salamander Grand Piano.*/}
                {/*    </p>*/}
                {/*</article>*/}
                <article className={infoCardClass}>
                    <h2 className="font-semibold text-mt-text">Kontakt</h2>
                    <p className="mt-2 text-sm leading-6 text-mt-sub">
                        Sugestie dotyczące rozwoju aplikacji oraz zgłoszenia błędów zauważonych na stronie możesz
                        przesyłać na adres:
                    </p>
                    <a
                        href="mailto:trenersluchu@proton.me"
                        className="mt-2 inline-block break-all text-sm font-medium text-mt-accent underline decoration-mt-accent/50 underline-offset-4 transition-colors hover:text-mt-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-accent"
                    >
                        trenersluchu@proton.me
                    </a>
                </article>
            </div>
        </section>
    )
}
