<script>
    import { slide } from "svelte/transition";
    import { data } from "./VocabularySetForm.svelte.js";

    let { submitButtonText, onsubmit } = $props();

    let nextCardIdx = $state(data.cards.length + 1);
    /** @type {number|null} */
    let draggedCardId = $state(null);
    /** @type {number|null} */
    let dragOverCardId = $state(null);

    /**
     * Adds a new blank card to the deck
     */
    function addCard() {
        data.cards.push({ id: nextCardIdx, term: "", definition: "" });
        nextCardIdx++;
    }

    /**
     * Removes a card from the deck
     * @param {number} id - The ID of the card to remove
     */
    function removeCard(id) {
        if (data.cards.length <= 1) {
            data.errorMessage = "You need at least one card in your deck";
            setTimeout(() => {
                data.errorMessage = "";
            }, 3000);
            return;
        }
        data.cards = data.cards.filter((card) => card.id !== id);
    }

    /**
     * Handles the start of a drag operation
     * @param {number} id - The ID of the card being dragged
     */
    function handleDragStart(id) {
        draggedCardId = id;
    }

    /**
     * Handles when a dragged item is over another card
     * @param {number} id - The ID of the card being dragged over
     */
    function handleDragOver(id) {
        if (id !== draggedCardId) {
            dragOverCardId = id;
        }
    }

    /**
     * Handles the end of a drag operation
     */
    function handleDragEnd() {
        if (draggedCardId !== null && dragOverCardId !== null) {
            // Find the indices of the cards
            const draggedIndex = data.cards.findIndex((c) => c.id === draggedCardId);
            const dropIndex = data.cards.findIndex((c) => c.id === dragOverCardId);

            if (draggedIndex !== -1 && dropIndex !== -1) {
                // Create a new array with the card moved to the new position
                const newCards = [...data.cards];
                const [movedCard] = newCards.splice(draggedIndex, 1);
                newCards.splice(dropIndex, 0, movedCard);

                // Update the cards array
                data.cards = newCards;
            }
        }

        // Reset drag state
        draggedCardId = null;
        dragOverCardId = null;
    }

    /**
     * Handles form submission
     * @param {Event} e - The submit event
     */
    function handleSubmit(e) {
        e.preventDefault();
        onsubmit();
    }
</script>

<form onsubmit={handleSubmit}>
    {#if data.errorMessage}
        <div class="error-message" transition:slide>{data.errorMessage}</div>
    {/if}
    {#if data.successMessage}
        <div class="success-message" transition:slide>
            {data.successMessage}
        </div>
    {/if}

    <div class="form-group">
        <label for="deck-name">Deck Name</label>
        <input
            type="text"
            id="deck-name"
            bind:value={data.deckName}
            placeholder="e.g. French Vocab"
            required
        />
    </div>

    <div class="form-group">
        <label for="deck-description">Description (optional)</label>
        <textarea
            id="deck-description"
            bind:value={data.deckDescription}
            placeholder="What is this vocabulary set about?"
            rows="3"
        ></textarea>
    </div>
    <div class="form-group checkbox-container">
        <label for="is-public" class="checkbox-label">
            <input type="checkbox" id="is-public" bind:checked={data.isPublic} />
            {data.isPublic ? "Public" : "Private"}
        </label>
        <p class="checkbox-description">
            {data.isPublic
                ? "Anyone can view and use this deck"
                : "Only you can access this deck"}
        </p>
    </div>

    <div class="cards-section">
        <div class="cards-header">
            <h2>Cards</h2>
        </div>

        <div class="cards-list">
            {#each data.cards as card (card.id)}
                <div
                    class="card-item {draggedCardId === card.id
                        ? 'dragging'
                        : ''} {dragOverCardId === card.id ? 'drag-over' : ''}"
                    transition:slide
                >
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="card-number"
                        draggable="true"
                        ondragstart={() => handleDragStart(card.id)}
                        ondragover={(e) => {
                            e.preventDefault();
                            handleDragOver(card.id);
                        }}
                        ondragend={handleDragEnd}
                        title="Drag to reorder"
                    >
                        {data.cards.findIndex((c) => c.id === card.id) + 1}
                    </div>
                    <div class="card-fields">
                        <div class="card-field">
                            <input
                                type="text"
                                bind:value={card.term}
                                placeholder="Term"
                                required
                            />
                        </div>
                        <div class="card-field">
                            <input
                                type="text"
                                bind:value={card.definition}
                                placeholder="Definition"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        class="remove-card-button"
                        onclick={() => removeCard(card.id)}
                        aria-label="Remove card"
                    >
                        ×
                    </button>
                </div>
            {/each}
        </div>

        <div class="add-card-container">
            <button type="button" class="add-card-button" onclick={addCard}>
                + Add Card
            </button>
        </div>
    </div>

    <button type="submit" class="submit-button" disabled={data.isSubmitting}>
        {data.isSubmitting ? "Saving..." : submitButtonText}
    </button>
</form>

<style>
    .form-group {
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.9rem;
        font-weight: 500;
    }

    input,
    textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
    }

    input:focus,
    textarea:focus {
        outline: none;
        border-color: #000;
    }

    .cards-section {
        margin-top: 30px;
        margin-bottom: 30px;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 20px;
        background-color: #f9f9f9;
    }

    .cards-header {
        margin-bottom: 20px;
    }

    .cards-header h2 {
        font-size: 1.4rem;
        margin: 0;
    }

    .cards-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 20px;
    }

    .card-item {
        display: flex;
        align-items: center;
        background-color: white;
        border-radius: 6px;
        padding: 15px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .card-item.dragging {
        opacity: 0.5;
    }

    .card-item.drag-over {
        border: 2px dashed #333;
    }

    .card-number {
        background-color: #eee;
        color: #555;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: bold;
        margin-right: 15px;
        flex-shrink: 0;
        cursor: grab;
        transition: background-color 0.2s ease;
    }

    .card-number:hover {
        background-color: #ddd;
    }

    .card-number:active {
        cursor: grabbing;
    }

    .card-fields {
        display: flex;
        flex: 1;
        gap: 15px;
    }

    .card-field {
        flex: 1;
    }

    .card-field input {
        padding: 10px;
    }

    .remove-card-button {
        background: none;
        border: none;
        color: #999;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
        line-height: 1;
        transition: color 0.2s;
    }

    .remove-card-button:hover {
        color: #ff3333;
    }

    .add-card-container {
        display: flex;
        justify-content: center;
    }

    .add-card-button {
        background-color: transparent;
        color: black;
        border: 1px solid black;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
    }

    .add-card-button:hover {
        background-color: black;
        color: white;
    }

    .add-card-button:active {
        transform: scale(0.95);
    }

    .submit-button {
        width: 100%;
        background-color: black;
        color: white;
        border: none;
        padding: 14px;
        font-size: 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition:
            transform 0.2s ease,
            background-color 0.2s ease;
    }

    .submit-button:hover:not(:disabled) {
        transform: translateY(-2px);
        background-color: #333;
    }

    .submit-button:active:not(:disabled) {
        transform: translateY(1px);
    }

    .submit-button:disabled {
        background-color: #999;
        cursor: not-allowed;
    }

    .checkbox-container {
        margin-bottom: 20px;
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        gap: 8px;
    }

    .checkbox-label input {
        width: auto;
        margin: 0;
    }

    .checkbox-description {
        margin-top: 4px;
        font-size: 0.85rem;
        color: #666;
        margin-left: 24px;
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

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .card-fields {
            flex-direction: column;
            gap: 10px;
        }
    }
</style>
