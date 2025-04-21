<script>
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase";
    import { goto } from "$app/navigation";
    import { setContext } from "svelte";
    import VocabularySetForm from "$lib/components/VocabularySetForm.svelte";
    import { data } from "$lib/components/VocabularySetForm.svelte.js";

    let ready = $state(false);

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


    $inspect(data.deckName);

    /**
     * Submits the form to create a new deck
     */
    async function handleSubmit() {
        // Reset messages
        data.errorMessage = "";
        data.successMessage = "";

        // Validate form
        if (!data.deckName.trim()) {
            data.errorMessage = "Please provide a name for your deck";
            return;
        }

        const validCards = data.cards.filter(
            (card) => card.term.trim() && card.definition.trim(),
        );

        if (validCards.length === 0) {
            data.errorMessage =
                "Please add at least one card with a term and definition";
            return;
        }

        if (validCards.length !== data.cards.length) {
            data.errorMessage = "All cards must have both a term and definition";
            return;
        }

        try {
            data.isSubmitting = true;

            // Step 1: Insert the deck
            if (user) {
                const { data: deckData, error: deckError } = await supabase
                    .from("decks")
                    .insert([
                        {
                            name: data.deckName,
                            description: data.deckDescription,
                            user_id: user.id,
                            is_public: data.isPublic,
                        },
                    ])
                    .select();

                if (deckError) throw deckError;
                if (!deckData || deckData.length === 0)
                    throw new Error("Failed to create deck");

                const deckId = deckData[0].id;

                // Step 2: Insert all cards with the deck_id
                const cardsToInsert = data.cards.map((card, index) => ({
                    deck_id: deckId,
                    term: card.term,
                    definition: card.definition,
                    position: index,
                }));

                const { error: cardsError } = await supabase
                    .from("cards")
                    .insert(cardsToInsert);

                if (cardsError) throw cardsError;

                // Success!
                data.successMessage = "Deck created successfully!";
                setTimeout(() => {
                    goto(`/deck/${deckId}`);
                }, 1000);
            } else throw new Error("Must be signed in to create a deck!");
        } catch (err) {
            console.error("Error creating deck:", err);
            data.errorMessage = "Failed to create deck. Please try again.";
        } finally {
            data.isSubmitting = false;
        }
    }
</script>

<main class={ready ? "visible" : ""}>
    <div class="create-container">
        <h1>Create Vocabulary Set</h1>
        <p>Build your custom vocabulary deck with terms and definitions.</p>

        <VocabularySetForm
            submitButtonText="Create Deck"
            onsubmit={handleSubmit}
        />
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

    .create-container {
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
</style>
