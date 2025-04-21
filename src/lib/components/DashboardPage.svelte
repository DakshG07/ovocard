<script>
    import { onMount } from "svelte";
    import { supabase } from "$lib/supabase";

    /**
     * @typedef {import("@supabase/supabase-js").User} User
     * @typedef {import("$lib/types").Deck} Deck
     */

    /** @type {User|null} */
    let user = null;
    /** @type {Deck[]} */
    let decks = [];
    let loading = true;

    onMount(async () => {
        console.log("dashboard");
        const { data } = await supabase.auth.getUser();
        if (data && data.user) {
            user = data.user;
            // Fetch user's decks
            const { data: decksData, error } = await supabase
                .from("decks")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            
            if (error) {
                console.error("Error fetching decks:", error);
            } else {
                decks = decksData || [];
            }
        }
        loading = false;
    });
</script>

<div class="dashboard-container">
    <h1>Dashboard</h1>
    {#if user}
        <p>Welcome back, {user.user_metadata?.name || user.email}!</p>
    {:else}
        <p>Loading your information...</p>
    {/if}

    <div class="dashboard-content">
        {#if loading}
            <div class="loading-state">
                <p>Loading your vocabulary sets...</p>
            </div>
        {:else if decks.length > 0}
            <div class="decks-grid">
                {#each decks as deck}
                    <a href="/deck/{deck.id}" class="deck-card">
                        <h3>{deck.name}</h3>
                        {#if deck.description}
                            <p class="deck-description">{deck.description}</p>
                        {:else}
                            <p class="deck-description no-description">No description</p>
                        {/if}
                        <div class="deck-meta">
                            <span class="visibility-badge">
                                {deck.is_public ? "Public" : "Private"}
                            </span>
                            <span class="date-badge">
                                {new Date(deck.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </a>
                {/each}
            </div>
            <div class="create-new">
                <a href="/create" class="create-button">Create New Set</a>
            </div>
        {:else}
            <div class="empty-state">
                <h2>Your vocabulary dashboard</h2>
                <p>Your vocabulary sets will appear here once you create them.</p>
                <a href="/create" class="create-button">Create First Set</a>
            </div>
        {/if}
    </div>
</div>

<style>
    .dashboard-container {
        width: 100%;
        max-width: 1000px;
        padding: 20px;
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

    .create-button {
        background-color: black;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            transform 0.2s ease;
        text-decoration: none;
        display: inline-block;
    }

    .create-button:hover {
        background-color: #333;
        transform: translateY(-2px);
    }

    .create-button:active {
        transform: translateY(1px);
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
        transition: transform 0.2s ease, box-shadow 0.2s ease;
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
    }

    .visibility-badge {
        background-color: #f0f0f0;
        padding: 4px 8px;
        border-radius: 4px;
        color: #666;
    }

    .date-badge {
        color: #999;
    }

    .create-new {
        text-align: center;
        margin-top: 20p0;
    }
</style>
