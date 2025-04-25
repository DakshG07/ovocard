<script>
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase";
    import { goto } from "$app/navigation";
    import VocabularySetForm from "$lib/components/VocabularySetForm.svelte";
    import { data } from "$lib/components/VocabularySetForm.svelte.js";
    import { getDeck } from "$lib/db";
    import { page } from "$app/state";
    import { error as errorPage } from "@sveltejs/kit";

    /** @typedef {import("$lib/types").Deck} Deck */
    /** @typedef {import("$lib/types").Card} Card */

    let ready = $state(false);
    /** @type {import("@supabase/supabase-js").User|null} */
    let user = null;
    const deckId = page.params.id;
    /** @type {Deck | null} */
    let deck = $state(null);
    /** @type {Card[] | null} */
    let cards = $state(null);
    /** @type {unknown | null} */
    let serverError = $state(null);

    onMount(async () => {
        if (serverError) console.error(serverError);
        const { data: authData } = await supabase.auth.getUser();
        ({ deck, cards } = await getDeck(deckId));
        if (!deck || !cards) {
            goto("/404");
        } else if (authData && authData.user) {
            user = authData.user;
            // Ensure they own the deck
            if (deck.user_id !== user.id) {
                goto("/");
            }
            data.deckName = deck.name;
            data.deckDescription = deck.description || "";
            data.isPublic = deck.is_public;

            data.cards = cards.map((/** @type {Card} */ card) => ({
                id: card.position + 1,
                term: card.term,
                definition: card.definition,
            }));
            data.errorMessage = "";
            data.successMessage = "";
            ready = true;
        } else {
            // Redirect to login if not authenticated
            goto("/login");
        }
    });

    /**
     * Submits the form to update the deck
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
            data.errorMessage =
                "All cards must have both a term and definition";
            return;
        }

        try {
            data.isSubmitting = true;

            // Update the deck
            const { error: deckError } = await supabase
                .from("decks")
                .update({
                    name: data.deckName,
                    description: data.deckDescription,
                    is_public: data.isPublic,
                })
                .eq("id", deckId);

            if (deckError) throw deckError;

            // Delete existing cards
            const { error: deleteError } = await supabase
                .from("cards")
                .delete()
                .eq("deck_id", deckId);

            if (deleteError) throw deleteError;

            // Insert updated cards
            const newCards = data.cards.map((card, index) => ({
                deck_id: deckId,
                term: card.term,
                definition: card.definition,
                position: index,
            }));

            const { error: cardsError } = await supabase
                .from("cards")
                .insert(newCards);

            if (cardsError) throw cardsError;

            // Success!
            data.successMessage = "Deck updated successfully!";
            setTimeout(() => {
                goto(`/deck/${deckId}`);
            }, 1000);
        } catch (err) {
            console.error("Error updating deck:", err);
            data.errorMessage = "Failed to update deck. Please try again.";
        } finally {
            data.isSubmitting = false;
        }
    }
</script>

<main class={ready ? "visible" : ""}>
    <div class="edit-container">
        <h1>Edit Vocabulary Set</h1>
        <p>Update your vocabulary deck with terms and definitions.</p>

        <VocabularySetForm
            submitButtonText="Save Changes"
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

    .edit-container {
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
