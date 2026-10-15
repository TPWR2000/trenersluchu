# Ear Trainer — Trener Słuchu Muzycznego (Monkeytype Style)

Nowoczesna, responsywna aplikacja internetowa do treningu słuchu muzycznego, stworzona w oparciu o ideę minimalistycznego i szybkiego interfejsu znanego z **Monkeytype**. Aplikacja umożliwia błyskawiczne ćwiczenie rozpoznawania interwałów, oferując tryby czasowe, limitowane zadania, pełną kontrolę nad kierunkiem odtwarzania oraz natychmiastowy podgląd błędów i odsłuch po zakończonej sesji.

---

## 🚀 Funkcje i Możliwości

- **Czysty, minimalistyczny interfejs (Focus Mode):** Podczas trwania sesji ukrywane są wszystkie zbędne elementy, pozostawiając jedynie timer/licznik, przycisk odsłuchu oraz przyciski odpowiedzi.
- **Naturalne brzmienie pianina:** Wykorzystanie profesjonalnych sampli fortepianowych (`Tone.Sampler`).
- **Elastyczne tryby sesji:**
    - **Ilościowy:** Sesje na 10, 20 lub 50 zadań.
    - **Czasowy:** Szybkie wyzwania na 15s, 30s lub 60s.
- **Kierunki odtwarzania:**
    - `W górę` (wstępująco)
    - `W dół` (zstępująco)
    - `Harmonicznie` (obie nuty naraz)
    - `Losowo` (mix wyżej wymienionych)
- **Konfiguracja zakresu:** Użytkownik może samodzielnie decydować, które interwały mają pojawiać się w sesji (od Prymy czystej do Oktawy).
- **Ekran podsumowania w stylu Monkeytype:**
    - Przejrzysta lista wszystkich zadań z sesji.
    - Oznaczenie poprawnych odpowiedzi oraz popełnionych błędów.
    - **Przycisk ponownego odsłuchu** dla każdego pojedynczego pytania w podsumowaniu.
- **Przycisk rezygnacji:** Możliwość przerwania sesji w dowolnym momencie.
- **Podejście Mobile-First:** Duże, wygodne przyciski dostosowane do ekranu smartfonów.

---

## 🛠️ Stos Technologiczny

- **Frontend:** React + TypeScript
- **Budowanie i dev-server:** Vite
- **Stylizowanie:** Tailwind CSS
- **Silnik Audio:** Tone.js (`Tone.Sampler` ze źródłem sampli Salamander Grand Piano)

---

## 💻 Jak Uruchomić Projekt Lokalnie

### Wymagania wstępne
- Zainstalowane środowisko **Node.js** (w wersji >= 18.x)
- Menedżer pakietów **npm** lub **pnpm** / **yarn**

### Krok po kroku

1. **Sklonuj repozytorium lub przejdź do katalogu projektu:**
   ```bash
   cd nazwa-twojego-projektu
   ```

2. **Zainstaluj zależności (dependencies):**
   ```bash
   npm install
   ```

3. **Uruchom serwer deweloperski:**
   ```bash
   npm run dev
   ```

4. **Otwórz aplikację w przeglądarce:**
   W konsoli pojawi się lokalny adres URL (domyślnie `http://localhost:5173`). Otwórz go w przeglądarce, aby korzystać z aplikacji.

---

## 📦 Budowanie Wersji Produkcyjnej

Aby zbudować zoptymalizowaną wersję produkcyjną gotową do wdrożenia (np. na Vercel, Netlify):

```bash
npm run build
```

Wygenerowane pliki znajdą się w katalogu `dist/`.