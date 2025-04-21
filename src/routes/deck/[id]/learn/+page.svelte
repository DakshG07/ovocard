<script>
    import { page } from "$app/state";
    import TextInput from "$lib/components/TextInput.svelte";

    // Get deck ID from the page store
    let { deckId } = page.data;

    // Sample data for now (will be replaced with actual deck data later)
    const sampleTerm = "incredible";
    const sampleDefinition =
        "So extraordinary as to seem impossible; unbelievable.";

    // State for the learn mode
    let isCorrect = $state(false);
    let showResult = $state(false);

    /**
     * Handle when the user completes the input
     * @param {CustomEvent} event - The complete event from TextInput
     */
    function handleComplete(event) {
        const userAnswer = event.detail.value.toLowerCase();
        isCorrect = userAnswer === sampleTerm.toLowerCase();
        showResult = true;
    }

    /**
     * Move to the next card
     */
    function nextCard() {
        // Reset state for the next card
        showResult = false;
        isCorrect = false;

        // In the future, this will load the next card from the deck
        console.log("Moving to next card");
    }
</script>

<main>
    <div class="learn-container">
        <h1>Learn Mode</h1>
        <p class="instructions">
            Type the word that matches the definition below.
        </p>

        <div class="definition-box">
            <p>{sampleDefinition}</p>
        </div>

        <TextInput
            term={sampleTerm}
            hints={3}
            disabled={showResult}
            on:complete={handleComplete}
        />

        {#if showResult}
            <div class="result {isCorrect ? 'correct' : 'incorrect'}">
                {#if isCorrect}
                    <p>Correct! Well done!</p>
                {:else}
                    <p>The correct answer was: <strong>{sampleTerm}</strong></p>
                {/if}
                <button class="next-button" onclick={nextCard}>Next Card</button
                >
            </div>
        {/if}
    </div>
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
        font-size: 2.2rem;
        margin-bottom: 10px;
    }

    .instructions {
        color: #666;
        margin-bottom: 30px;
        text-align: center;
    }

    .definition-box {
        width: 100%;
        max-width: 600px;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 10px;
        background-color: #f9f9f9;
        margin-bottom: 30px;
    }

    .definition-box p {
        font-size: 1.2rem;
        line-height: 1.5;
        margin: 0;
    }

    .result {
        margin-top: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        text-align: center;
    }

    .result.correct {
        background-color: #e8f5e9;
        color: #2e7d32;
    }

    .result.incorrect {
        background-color: #ffebee;
        color: #c62828;
    }

    .next-button {
        margin-top: 15px;
        padding: 10px 20px;
        background-color: #000;
        color: #fff;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .next-button:hover {
        background-color: #333;
    }
</style>
