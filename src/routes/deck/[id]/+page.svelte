<script>
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import { supabase } from "$lib/supabase";
    import { formatRelativeDate } from "$lib/utils";
    import { getDeck, copyDeck, deleteDeck } from "$lib/db";
    import LucidePencil from "~icons/lucide/pencil";
    import LucideCopy from "~icons/lucide/copy";
    import LucideTrash from "~icons/lucide/trash-2";

    /** @typedef {import('$lib/types').Deck} Deck */
    /** @typedef {import('$lib/types').Card} Card */

    const deckId = page.params.id;
    /** @type {Deck | null} */
    let deck = $state(null);
    /** @type {Card[] | null} */
    let cards = $state(null);
    /** @type {unknown | null} */
    let serverError = $state(null);

    let loading = $state(true);
    let error = $state("");
    let isOwner = $state(false);

    // Flashcard state
    let currentCardIndex = $state(0);
    /** @type {boolean[]} */
    let flippedStates = $state([]);
    /** @type {number} */
    let windowWidth = $state(769);
    /** @type {boolean} */
    let isMobile = $derived(windowWidth <= 768);

    // Touch/drag state
    let touchStartX = $state(0);
    let touchEndX = $state(0);
    let isDragging = $state(false);
    let dragOffset = $state(0);
    /** @type {HTMLDivElement | null} */
    let cardContainer = $state(null);
    let deleteConfirmed = $state(false);

    // Format creation date
    let formattedDate = $derived.by(() => {
        if (!deck) return "";
        return formatRelativeDate(deck.created_at);
    });

    $inspect(serverError);

    async function setup() {
        ({ deck, cards, error: serverError } = await getDeck(deckId));
        if (!deck || !cards || serverError) {
            // redirect to 404
            goto("/404");
            return;
        } else {
            flippedStates = new Array(cards.length).fill(false);
            checkAuth();
            loading = false;
        }
    }

    onMount(() => {
        setup();

        // Get initial window width
        const updateWindowWidth = () => {
            windowWidth = window.innerWidth;
        };

        // Initial check
        updateWindowWidth();

        // Add event listener for window resize
        window.addEventListener("resize", updateWindowWidth);

        // Check authentication status
        checkAuth();

        // Return cleanup function
        return () => {
            window.removeEventListener("resize", updateWindowWidth);
        };
    });

    // Handle authentication check separately
    async function checkAuth() {
        if (!deck) return;
        // Check if user owns the deck
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user && deck.user_id === user.id) {
            isOwner = true;
        }
    }

    /**
     * Flips the current card
     */
    function flipCard() {
        flippedStates[currentCardIndex] = !flippedStates[currentCardIndex];
    }

    /**
     * Moves to the next card
     */
    function nextCard() {
        if (!cards) return;
        let index = currentCardIndex;
        setTimeout(() => {
            flippedStates[index] = false;
        }, 150);
        if (currentCardIndex < cards.length - 1) {
            currentCardIndex++;
        } else {
            // Loop back to the first card
            currentCardIndex = 0;
        }
    }

    /**
     * Moves to the previous card
     */
    function prevCard() {
        if (!cards) return;
        let index = currentCardIndex;
        setTimeout(() => {
            flippedStates[index] = false;
        }, 150);
        if (currentCardIndex > 0) {
            currentCardIndex--;
        } else {
            // Loop to the last card
            currentCardIndex = cards.length - 1;
        }
    }

    /**
     * Handles keyboard shortcuts
     * @param {KeyboardEvent} e - The keyboard event
     */
    function handleKeydown(e) {
        if (loading) return;

        // Prevent default behavior for arrow keys and space to avoid page scrolling
        if (
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
                e.key,
            )
        ) {
            e.preventDefault();
        }

        switch (e.key) {
            case " ": // Space
            case "ArrowUp":
            case "ArrowDown":
                flipCard();
                break;
            case "ArrowRight":
            case "d":
                nextCard();
                break;
            case "ArrowLeft":
            case "a":
                prevCard();
                break;
            default:
                break;
        }
    }

    /**
     * Handle touch start event for card dragging
     * @param {TouchEvent} event - The touch event
     */
    function handleTouchStart(event) {
        if (!isMobile) return;

        touchStartX = event.touches[0].clientX;
        isDragging = true;
        dragOffset = 0;
    }

    /**
     * Handle touch move event for card dragging
     * @param {TouchEvent} event - The touch event
     */
    function handleTouchMove(event) {
        if (!isMobile || !isDragging) return;

        touchEndX = event.touches[0].clientX;
        dragOffset = touchEndX - touchStartX;

        // Limit drag to prevent excessive movement
        if (dragOffset > 100) dragOffset = 100;
        if (dragOffset < -100) dragOffset = -100;
    }

    /**
     * Handle touch end event for card dragging
     */
    function handleTouchEnd() {
        if (!isMobile || !isDragging) return;

        isDragging = false;

        // Determine if swipe was significant enough to change cards
        const swipeThreshold = 50;

        if (dragOffset > swipeThreshold) {
            // Swiped right - go to previous card
            prevCard();
        } else if (dragOffset < -swipeThreshold) {
            // Swiped left - go to next card
            nextCard();
        }

        // Reset drag offset
        dragOffset = 0;
    }

    async function handleCopy() {
        let { id, error } = await copyDeck(deckId);
        if (error || !id) {
            error = error || "Failed to copy deck";
        } else {
            window.location.href = `/deck/${id}`;
        }
    }

    async function handleDelete() {
        if (!deleteConfirmed) {
            deleteConfirmed = true;
            setTimeout(() => {
                deleteConfirmed = false;
            }, 1000);
            return;
        }
        await deleteDeck(deckId);
        goto("/");
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<main>
    {#if loading}
        <div class="loading-container">
            <div class="loader"></div>
            <p>Loading deck...</p>
        </div>
    {:else if error || !deck || !cards}
        <div class="error-container">
            <h2>Error</h2>
            <p>{error}</p>
            <a href="/" class="back-link">Back to Home</a>
        </div>
    {:else}
        <div class="deck-header">
            <div class="deck-title-row">
                <h1>{deck.name}</h1>
                <div class="deck-actions">
                    {#if isOwner}
                        <a
                            href="/deck/{deckId}/edit"
                            class="edit-button desktop-only"
                        >
                            <LucidePencil width={14} height={14} />
                            Edit
                        </a>
                    {/if}
                    <button
                        class="copy-button desktop-only"
                        onclick={handleCopy}
                    >
                        <LucideCopy width={14} height={14} />
                        Copy
                    </button>
                    {#if isOwner}
                        <button
                            class="delete-button desktop-only"
                            onclick={handleDelete}
                        >
                            <LucideTrash width={14} height={14} />
                            {deleteConfirmed
                                ? "Press again to Delete"
                                : "Delete"}
                        </button>
                    {/if}
                </div>
            </div>
            <p class="deck-description">
                {deck.description || "No description provided"}
                {#if formattedDate}
                    <span class="deck-date"> - <i>{formattedDate}</i></span>
                {/if}
            </p>

            <div class="deck-meta">
                <span
                    >{cards.length}
                    {cards.length === 1 ? "card" : "cards"}</span
                >
                <div class="deck-actions">
                    {#if isOwner}
                        <a
                            href="/deck/{deckId}/edit"
                            class="edit-button mobile-only"
                        >
                            <LucidePencil width={14} height={14} />
                            Edit
                        </a>
                    {/if}
                    <button
                        class="copy-button mobile-only"
                        onclick={handleCopy}
                    >
                        <LucideCopy width={14} height={14} />
                        Copy
                    </button>
                    {#if isOwner}
                        <button
                            class="delete-button mobile-only"
                            onclick={handleDelete}
                        >
                            <LucideTrash width={14} height={14} />
                            {deleteConfirmed
                                ? "Press again to Delete"
                                : "Delete"}
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        {#if cards.length === 0}
            <div class="empty-state">
                <p>
                    This deck doesn't have any cards yet. How did you even
                    create it?
                </p>
            </div>
        {:else}
            <div class="flashcard-container">
                <div
                    class="flashcards-row {cards.length === 1
                        ? 'single-card'
                        : ''}"
                    style="transform: translateX({isMobile
                        ? -currentCardIndex * (windowWidth - 20) +
                          dragOffset +
                          'px'
                        : -currentCardIndex * 520 + 'px'})"
                    bind:this={cardContainer}
                    ontouchstart={handleTouchStart}
                    ontouchmove={handleTouchMove}
                    ontouchend={handleTouchEnd}
                >
                    {#each cards as card, i}
                        <!-- Flashcard -->
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <div
                            class="flashcard {isMobile || i === currentCardIndex
                                ? 'active'
                                : ''} {flippedStates[i] ? 'flipped' : ''}"
                            onclick={flipCard}
                        >
                            <div class="card-inner">
                                <div class="card-front">
                                    <div class="card-content">
                                        {card?.term || ""}
                                    </div>
                                    <div
                                        class="card-hint"
                                        style="opacity: {flippedStates[i]
                                            ? 0
                                            : 1}"
                                    >
                                        Click to flip
                                    </div>
                                </div>
                                <div class="card-back">
                                    <div class="card-content">
                                        {card?.definition || ""}
                                    </div>
                                    <div
                                        class="card-hint"
                                        style="opacity: {flippedStates[i]
                                            ? 1
                                            : 0}"
                                    >
                                        Click to flip back
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
            <div class="progress-container">
                <div class="card-progress">
                    <div
                        class="progress-bar"
                        style="width: {((currentCardIndex + 1) / cards.length) *
                            100}%"
                    ></div>
                </div>

                <div class="card-counter">
                    {currentCardIndex + 1} / {cards.length}
                </div>
            </div>

            <div class="card-navigation">
                <button
                    onclick={prevCard}
                    class="nav-button prev"
                    title="Previous card (Left arrow)"
                >
                    ←
                </button>
                <button
                    onclick={nextCard}
                    class="nav-button next"
                    title="Next card (Right arrow)"
                >
                    →
                </button>
            </div>

            <div class="learn-button-container">
                <a href="/deck/{deckId}/learn" class="learn-button">
                    Learn Mode
                </a>
            </div>

            <div class="keyboard-shortcuts desktop-only">
                <p>Keyboard shortcuts: Space/↑/↓ (flip), ←/→ (navigate)</p>
            </div>
        {/if}
    {/if}
</main>

<style>
    main {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px 20px;
        min-height: calc(100vh - 60px);
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 70vh;
    }

    .loader {
        border: 5px solid #f3f3f3;
        border-top: 5px solid #000;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .error-container {
        text-align: center;
        padding: 40px;
    }

    .back-link {
        display: inline-block;
        margin-top: 20px;
        color: #000;
        text-decoration: none;
        font-weight: 500;
        padding: 10px 20px;
        border: 1px solid #000;
        border-radius: 4px;
    }

    .back-link:hover {
        background-color: #000;
        color: #fff;
    }

    .deck-header {
        background-color: white;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 40px;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
    }

    .deck-header h1 {
        font-size: 1.2rem;
        margin: 0 0 10px 0;
        word-break: break-word;
    }

    .deck-description {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 15px;
    }

    .deck-date {
        color: #999;
        font-size: 0.8rem;
    }

    .deck-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        margin-top: auto;
        flex-wrap: wrap;
        gap: 5px;
    }

    .empty-state {
        text-align: center;
        padding: 60px 0;
        color: #666;
    }

    .flashcard-container {
        position: relative;
        margin-bottom: 30px;
        overflow: visible;
        width: 100%;
        padding: 20px 0;
    }

    .card-progress {
        height: 4px;
        background-color: #eee;
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background-color: #000;
        transition: width 0.3s ease;
    }

    .card-counter {
        text-align: center;
        font-size: 0.9rem;
        color: #666;
        margin-top: 8px;
        margin-bottom: 10px;
    }

    .flashcards-row {
        display: flex;
        gap: 20px;
        width: fit-content;
        margin: 0 auto;
        padding-left: calc(50% - 250px);
        transition: transform 0.3s ease;
    }

    .flashcards-row.single-card {
        padding-left: 0;
    }

    .flashcard {
        position: relative;
        height: 300px;
        width: 500px;
        perspective: 1000px;
        cursor: pointer;
        flex-shrink: 0;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    .flashcard.active {
        z-index: 1;
        opacity: 1;
        pointer-events: auto;
    }

    .card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.4s;
        transform-style: preserve-3d;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }

    .flashcard.flipped .card-inner {
        transform: rotateX(180deg);
    }

    .card-front,
    .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 30px;
        box-sizing: border-box;
        border-radius: 10px;
    }

    .card-front {
        background-color: #f8f8f8;
        border: 1px solid #eee;
    }

    .card-back {
        background-color: #f0f0f0;
        transform: rotateX(180deg);
        border: 1px solid #eee;
    }

    .card-content {
        font-size: 1.5rem;
        text-align: center;
        overflow-wrap: break-word;
        word-break: break-word;
        max-width: 100%;
        max-height: 80%;
        overflow-y: auto;
        padding: 10px;
        /* Add custom scrollbar styling */
        scrollbar-width: thin;
        scrollbar-color: #aaa #f0f0f0;
    }

    /* Webkit scrollbar styling */
    .card-content::-webkit-scrollbar {
        width: 6px;
    }

    .card-content::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 3px;
    }

    .card-content::-webkit-scrollbar-thumb {
        background-color: #aaa;
        border-radius: 3px;
    }

    .card-hint {
        position: absolute;
        bottom: 15px;
        font-size: 0.8rem;
        color: #aaa;
        z-index: 2;
        transition: opacity 0.2s ease;
    }

    .card-navigation {
        display: flex;
        justify-content: center;
        gap: 20px;
        align-items: center;
        margin-top: 20px;
    }

    .nav-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
        border: 1px solid #ddd;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #666;
    }

    .nav-button:hover {
        background-color: #f5f5f5;
        border-color: #ccc;
        transform: scale(1.05);
    }

    .learn-button-container {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    .learn-button {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 2px solid #4caf50;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-block;
    }

    .learn-button:hover {
        background-color: #b7d6b8;
        border-color: #2e7d32;
        transform: translateY(-2px);
    }

    .learn-button:active {
        transform: translateY(2px);
    }

    .keyboard-shortcuts {
        text-align: center;
        font-size: 0.8rem;
        color: #777;
        margin-top: 30px;
    }

    .deck-actions {
        display: flex;
        gap: 8px;
    }

    .edit-button,
    .copy-button,
    .delete-button {
        background-color: transparent;
        border: 1px solid #000;
        padding: 4px 8px;
        border-radius: 4px;
        text-decoration: none;
        font-size: 0.8rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
    }

    .copy-button,
    .edit-button {
        color: #000;
    }

    .edit-button:hover,
    .copy-button:hover {
        background-color: #000;
        color: #fff;
    }

    .delete-button {
        color: #dc2626;
        border-color: #dc2626;
    }

    .delete-button:hover {
        background-color: #dc2626;
        color: #fff;
    }

    /* Mobile-specific classes */
    .mobile-only {
        display: none;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .flashcard {
            height: 250px;
            width: 100%;
            max-width: calc(100vw - 40px);
        }

        .card-content {
            font-size: 1.2rem;
        }

        .nav-button {
            width: 40px;
            height: 40px;
        }

        .desktop-only {
            display: none;
        }

        .mobile-only {
            display: inline-block;
        }

        .deck-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .flashcards-row {
            padding-left: 0;
            width: 100%;
        }

        .flashcards-row.single-card {
            justify-content: center;
        }

        main {
            overflow-x: hidden;
        }
    }

    .deck-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
</style>
