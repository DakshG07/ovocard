<script>
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import TextInput from "$lib/components/TextInput.svelte";
    import { fade, fly } from "svelte/transition";
    import { getDeck } from "$lib/db";

    /** @typedef {import("$lib/types").Card} Card */
    /** @typedef {import("$lib/types").Deck} Deck */
    /** @typedef {{ term: string, definition: string, hints: number }} Word */

    const deckId = page.params.id;
    /** @type {Deck | null} */
    let deck = $state(null);
    /** @type {Card[] | null} */
    let cards = $state(null);
    /** @type {unknown | null} */
    let serverError = $state(null);

    // Loading state
    let loading = $state(true);

    // Learn mode state
    /** @type {Word[]} */
    let words = $state([]);
    /** @type {Word|null} */
    let currentWord = $state(null);
    let isCorrect = $state(false);
    let showDialog = $state(false);
    /** @type {boolean} */
    let isComplete = $state(false);
    /** @type {number} */
    let progress = $state(0);
    /** @type {number} */
    const totalHints = $derived.by(() => {
        if (!cards) return 0;
        return cards.reduce(
            (/** @type {number} */ sum, /** @type {Card} */ card) =>
                sum + card.term.length,
            0,
        );
    });

    onMount(async () => {
        ({ deck, cards, error: serverError } = await getDeck(deckId));
        if (!deck || !cards || serverError) {
            goto("/404");
            return;
        } else {
            loading = false;
            words = cards.map((/** @type {Card} */ card) => {
                return {
                    term: card.term,
                    definition: card.definition,
                    hints: card.term.length,
                };
            });
            pickWord();
        }
    });

    $inspect(progress);

    function pickWord() {
        if (words.length === 0) {
            isComplete = true;
            return;
        }
        const max = Math.min(...words.map((w) => w.term.length - w.hints));
        const availableWords = words.filter(
            (w) => w.term.length - w.hints === max,
        );
        let idx = Math.floor(Math.random() * availableWords.length);
        // Make sure the selected word is different from the current one
        if (currentWord && availableWords.length > 1) {
            while (availableWords[idx] === currentWord) {
                idx = Math.floor(Math.random() * availableWords.length);
            }
        }
        let word = availableWords[idx];
        // Remove finished words
        words = words.filter((w) => w.hints >= 0);
        currentWord = word;
    }

    /**
     * Handle submission from TextInput
     * @param {string} word - The submitted word
     */
    function handleSubmit(word) {
        if (!currentWord) return;

        const isAnswerCorrect =
            word.toLowerCase() === currentWord.term.toLowerCase();

        // Show result dialog
        isCorrect = isAnswerCorrect;
        showDialog = true;

        // Hide dialog after delay and pick next word
        setTimeout(
            () => {
                showDialog = false;
                if (isAnswerCorrect && currentWord) {
                    currentWord.hints -= 2;
                    if (currentWord.hints < 0) {
                        progress++;
                    } else progress += 2;
                }
                pickWord();
            },
            isAnswerCorrect ? 1000 : 2000,
        );
    }

    /**
     * Go back to deck view
     */
    function goBackToDeck() {
        goto(`/deck/${deckId}`);
    }

    /**
     * Restart learn mode
     */
    function restartLearnMode() {
        window.location.reload();
    }

    $inspect(words);
</script>

<main>
    {#if loading}
        <div class="loading-screen">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    {:else}
        <div class="learn-container">
            <h1>Learn Mode</h1>
            <p class="instructions">
                Type the word that matches the definition below.
            </p>

            {#if isComplete}
                <div
                    class="completion-screen"
                    transition:fly={{ y: 20, duration: 300 }}
                >
                    <h2>Success! 🎉</h2>
                    <p>You've completed all the cards in this deck!</p>
                    <div class="completion-buttons">
                        <button
                            class="restart-button"
                            onclick={restartLearnMode}
                        >
                            Learn Again
                        </button>
                        <button class="back-button" onclick={goBackToDeck}>
                            Back to Deck
                        </button>
                    </div>
                </div>
            {:else if currentWord}
                <div class="card-container">
                    <div class="progress-container">
                        <div
                            class="progress-bar"
                            style="width: {(progress / totalHints) * 100}%"
                        ></div>
                    </div>

                    <div class="definition-box">
                        <h2>Definition:</h2>
                        <p>{currentWord.definition}</p>
                    </div>

                    <div class="input-section">
                        <h3>What is the term?</h3>
                        <TextInput
                            term={currentWord.term}
                            hints={currentWord.hints}
                            disabled={showDialog}
                            onsubmit={handleSubmit}
                        />
                    </div>

                    {#if showDialog}
                        <div
                            class="result-dialog {isCorrect
                                ? 'correct'
                                : 'incorrect'}"
                            transition:fade
                        >
                            {#if isCorrect}
                                <p>Correct! 🎉</p>
                            {:else}
                                <p>
                                    Incorrect. The term is: <strong
                                        >{currentWord.term}</strong
                                    >
                                </p>
                            {/if}
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 20px;
        min-height: calc(100vh - 60px);
    }

    .learn-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 10px;
        text-align: center;
    }

    .card-container {
        width: 100%;
        max-width: 600px;
        display: flex;
        flex-direction: column;
        gap: 30px;
    }

    .progress-container {
        width: 100%;
        height: 4px;
        background-color: #eee;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 8px;
    }

    .progress-bar {
        height: 100%;
        background-color: #4caf50;
        transition: width 0.3s ease;
    }

    .definition-box {
        background-color: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }

    .definition-box h2 {
        font-size: 1.3rem;
        margin-bottom: 15px;
        color: #333;
    }

    .definition-box p {
        font-size: 1.2rem;
        line-height: 1.5;
        color: #444;
    }

    .input-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .input-section h3 {
        font-size: 1.2rem;
        color: #555;
    }

    .result-dialog {
        text-align: center;
        padding: 15px;
        border-radius: 8px;
        margin-top: 10px;
        font-size: 1.1rem;
        font-weight: 500;
    }

    .result-dialog.correct {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;
    }

    .result-dialog.incorrect {
        background-color: #ffebee;
        color: #c62828;
        border: 1px solid #ef9a9a;
    }

    .completion-screen {
        text-align: center;
        padding: 40px;
        background-color: #f8f8f8;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        max-width: 500px;
    }

    .completion-screen h2 {
        font-size: 2rem;
        margin-bottom: 15px;
        color: #2e7d32;
    }

    .completion-screen p {
        font-size: 1.2rem;
        color: #555;
        margin-bottom: 30px;
    }

    .completion-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
    }

    .restart-button,
    .back-button {
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .restart-button {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 2px solid #4caf50;
    }

    .restart-button:hover {
        background-color: #b7d6b8;
        border-color: #2e7d32;
        transform: translateY(-2px);
    }

    .back-button {
        background-color: #f5f5f5;
        color: #555;
        border: 2px solid #ddd;
    }

    .back-button:hover {
        background-color: #e0e0e0;
        border-color: #bbb;
        transform: translateY(-2px);
    }

    .restart-button:active,
    .back-button:active {
        transform: translateY(2px);
    }

    @media (max-width: 768px) {
        .definition-box {
            padding: 20px;
        }

        .definition-box h2 {
            font-size: 1.2rem;
        }

        .definition-box p {
            font-size: 1.1rem;
        }

        .completion-buttons {
            flex-direction: column;
        }
    }

    .loading-screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        gap: 20px;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4caf50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .loading-screen p {
        color: #666;
        font-size: 1.1rem;
    }
</style>
