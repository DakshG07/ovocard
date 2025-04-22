<script>
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase";
    import { formatRelativeDate } from "$lib/utils";

    /** @typedef {import("@supabase/supabase-js").User} User */
    /** @typedef {import("$lib/types").Deck} Deck */

    /** @type {User|null} */
    let user = null;
    /** @type {Deck[]} */
    let decks = $state([]);
    let loading = $state(true);
    /** @type {boolean} */
    let isMobile = $state(false);

    // Check if device is mobile
    const checkMobile = () => {
        isMobile = window.innerWidth <= 768;
    };

    async function getDecks() {
        const { data: authData } = await supabase.auth.getUser();
        if (authData && authData.user) {
            user = authData.user;
        }

        // Start with base query for public decks
        let query = supabase.from("decks").select("*").eq("is_public", true);

        // Only exclude user's own decks if they are signed in
        if (user) {
            query = query.neq("user_id", user.id);
        }

        // Add ordering
        query = query.order("created_at", { ascending: false });

        const { data: decksData, error } = await query;

        if (error) {
            console.error("Error fetching decks:", error);
        } else {
            decks = decksData || [];
        }
        loading = false;
    }

    onMount(() => {
        // Initial mobile check
        checkMobile();

        // Add event listener for window resize
        window.addEventListener("resize", checkMobile);

        getDecks();

        // Return cleanup function
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    });
</script>

<main class:mobile={isMobile}>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1>Public Decks</h1>
            <p>Discover vocabulary sets created by other users.</p>
        </div>

        <div class="dashboard-content">
            {#if loading}
                <div class="loading-state">
                    <p>Loading public decks...</p>
                </div>
            {:else if decks.length > 0}
                <div class="decks-grid">
                    {#each decks as deck}
                        <a href="/deck/{deck.id}" class="deck-card">
                            <h3>{deck.name}</h3>
                            {#if deck.description}
                                <p class="deck-description">
                                    {deck.description}
                                </p>
                            {:else}
                                <p class="deck-description no-description">
                                    No description
                                </p>
                            {/if}
                            <div class="deck-meta">
                                <span class="date-badge">
                                    {formatRelativeDate(deck.created_at)}
                                </span>
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="empty-state">
                    <h2>No public decks available</h2>
                    <p>There are no public vocabulary sets at the moment.</p>
                </div>
            {/if}
        </div>
    </div>
</main>

<style>
    main {
        height: calc(100vh - 60px);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Remove vertical centering for mobile */
    main.mobile {
        align-items: flex-start;
        height: auto;
        min-height: calc(100vh - 60px);
    }

    .dashboard-container {
        width: 100%;
        max-width: 1000px;
        padding: 20px;
        margin: 0 auto;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    p {
        color: #555;
        margin-bottom: 1.5rem;
    }

    .dashboard-content {
        margin-top: 30px;
    }

    .loading-state {
        text-align: center;
        padding: 40px;
        color: #666;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 50px 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
        text-align: center;
    }

    .empty-state h2 {
        font-size: 1.5rem;
        margin-bottom: 10px;
    }

    .empty-state p {
        margin-bottom: 20px;
    }

    .decks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .deck-card {
        background-color: white;
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 20px;
        text-decoration: none;
        color: inherit;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        display: flex;
        flex-direction: column;
        min-height: 120px;
    }

    .deck-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .deck-card h3 {
        margin: 0 0 10px 0;
        font-size: 1.2rem;
        word-break: break-word;
    }

    .deck-description {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 15px;
        flex: 1;
    }

    .no-description {
        font-style: italic;
        color: #999;
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

    .date-badge {
        color: #999;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
        .dashboard-container {
            padding: 15px;
        }

        h1 {
            font-size: 1.8rem;
        }

        .decks-grid {
            grid-template-columns: 1fr;
        }

        .deck-card {
            min-height: 100px;
        }
    }
</style>
