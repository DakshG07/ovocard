<script>
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase";
    import { goto } from "$app/navigation";
    import { slide } from "svelte/transition";
    import LucideCloudDownload from "~icons/lucide/cloud-download";
    import { data } from "$lib/components/VocabularySetForm.svelte.js";

    let ready = $state(false);
    let importText = $state("");
    let isSubmitting = $state(false);
    let errorMessage = $state("");
    let successMessage = $state("");
    let wordDefSeparator = $state("\\t"); // Default separator for word and definition
    let cardSeparator = $state("\\n"); // Default separator between cards

    /** @type {import("@supabase/supabase-js").User|null} */
    let user = null;

    onMount(async () => {
        const { data: authData } = await supabase.auth.getUser();
        if (authData && authData.user) {
            user = authData.user;
            ready = true;
        } else {
            // Redirect to login if not authenticated
            goto("/login");
        }
    });

    async function handleImport() {
        if (!importText.trim()) {
            errorMessage = "Please paste your Quizlet export data";
            return;
        }

        if (!wordDefSeparator.trim()) {
            errorMessage = "Please enter a word/definition separator";
            return;
        }

        if (!cardSeparator.trim()) {
            errorMessage = "Please enter a card separator";
            return;
        }

        try {
            isSubmitting = true;
            errorMessage = "";
            successMessage = "";

            // Convert the raw separator strings to actual characters for processing
            const actualWordDefSeparator = wordDefSeparator
                .replace(/\\t/g, "\t")
                .replace(/\\n/g, "\n");
            const actualCardSeparator = cardSeparator
                .replace(/\\t/g, "\t")
                .replace(/\\n/g, "\n");

            // Parse the import text into cards
            const lines = importText.split(actualCardSeparator);
            let parsedCards = [];

            for (let line of lines) {
                line = line.trim();
                if (!line) continue; // Skip empty lines

                const parts = line.split(actualWordDefSeparator);
                if (parts.length >= 2) {
                    const term = parts[0].trim();
                    // Join all remaining parts as the definition (in case definition contains the separator)
                    const definition = parts
                        .slice(1)
                        .join(actualWordDefSeparator)
                        .trim();

                    if (term && definition) {
                        parsedCards.push({ term, definition });
                    }
                }
            }

            // Validate that we have at least one valid card
            if (parsedCards.length === 0) {
                errorMessage =
                    "No valid cards found in the imported text. Please check your separators.";
                isSubmitting = false;
                return;
            }

            // Initialize the form data
            data.deckName = "";
            data.deckDescription = "";
            data.isPublic = true;
            data.isSubmitting = false;
            data.errorMessage = "";
            data.successMessage = "";

            // Populate cards with the parsed data
            data.cards = parsedCards.map((card, index) => ({
                id: index + 1,
                term: card.term,
                definition: card.definition,
            }));

            successMessage = `Successfully imported ${parsedCards.length} cards!`;
            setTimeout(() => {
                goto("/create?import=true");
            }, 1000);
        } catch (err) {
            console.error("Error importing deck:", err);
            errorMessage = "Failed to import deck. Please try again.";
        } finally {
            isSubmitting = false;
        }
    }
</script>

<main class={ready ? "visible" : ""}>
    <div class="import-container">
        <h1>Import from Quizlet</h1>
        <p>Import your Quizlet flashcards.</p>

        <div class="instructions">
            <h2>How to export from Quizlet:</h2>
            <ol>
                <li>Open your Quizlet set</li>
                <li>Click the three dots (...) menu</li>
                <li>Select "Export"</li>
                <li>Choose "Text" format</li>
                <li>Copy the exported text</li>
                <li>Paste it below</li>
            </ol>
        </div>

        <div class="import-form">
            <textarea
                bind:value={importText}
                placeholder="Paste your Quizlet export data here..."
                rows="10"
            ></textarea>

            <div class="separator-boxes">
                <div class="separator-box">
                    <label for="word-def-separator"
                        >Word/Definition Separator:</label
                    >
                    <input
                        id="word-def-separator"
                        type="text"
                        bind:value={wordDefSeparator}
                        maxlength="5"
                    />
                    <div class="separator-info">
                        Character(s) that separate the word from its definition
                        (use \t for tab, \n for newline)
                    </div>
                </div>

                <div class="separator-box">
                    <label for="card-separator">Card Separator:</label>
                    <input
                        id="card-separator"
                        type="text"
                        bind:value={cardSeparator}
                        maxlength="5"
                    />
                    <div class="separator-info">
                        Character(s) that separate different flashcards (use \t
                        for tab, \n for newline)
                    </div>
                </div>
            </div>

            {#if errorMessage}
                <div class="error-message" transition:slide>{errorMessage}</div>
            {/if}

            {#if successMessage}
                <div class="success-message" transition:slide>
                    {successMessage}
                </div>
            {/if}

            <button
                class="import-button"
                onclick={handleImport}
                disabled={isSubmitting}
            >
                <LucideCloudDownload width={14} height={14} />
                {isSubmitting ? "Importing..." : "Import Deck"}
            </button>
        </div>
    </div>
</main>

<style>
    main {
        min-height: calc(100vh - 60px);
        display: flex;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.5s ease;
        padding: 40px 20px;
    }

    main.visible {
        opacity: 1;
    }

    .import-container {
        width: 100%;
        max-width: 800px;
    }

    h1 {
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
    }

    p {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        color: #555;
    }

    .instructions {
        background-color: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 2rem;
    }

    .instructions h2 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: #333;
    }

    .instructions ol {
        margin: 0;
        padding-left: 1.5rem;
        color: #555;
    }

    .instructions li {
        margin-bottom: 0.5rem;
    }

    .import-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        min-height: 200px;
    }

    textarea:focus {
        outline: none;
        border-color: #000;
    }

    .error-message {
        background-color: #fff3f3;
        color: #e53935;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }

    .success-message {
        background-color: #f0fff0;
        color: #2e7d32;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }

    .import-button {
        background-color: #000;
        color: #fff;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        align-self: flex-start;
    }

    .import-button:hover:not(:disabled) {
        background-color: #333;
        transform: translateY(-2px);
    }

    .import-button:active:not(:disabled) {
        transform: translateY(2px);
    }

    .import-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .separator-boxes {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }

    .separator-box {
        background-color: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 15px;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .separator-box label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
    }

    .separator-box input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        text-align: left;
        font-family: monospace;
        box-sizing: border-box;
    }

    .separator-box input:focus {
        outline: none;
        border-color: #000;
    }

    .separator-info {
        font-size: 0.9rem;
        color: #666;
        margin-top: 8px;
        text-align: left;
        width: 100%;
    }

    @media (max-width: 768px) {
        .import-button {
            width: 100%;
        }

        .separator-boxes {
            flex-direction: column;
            gap: 15px;
        }
    }
</style>
