<script>
    import { onMount } from "svelte";
    import { checkAuthStatus } from "$lib/auth";
    import LandingPage from "$lib/components/LandingPage.svelte";
    import DashboardPage from "$lib/components/DashboardPage.svelte";
    import { isAuthError } from "@supabase/supabase-js";

    /** @type {boolean | null} */
    let isAuthenticated = $state(null);

    onMount(async () => {
        isAuthenticated = await checkAuthStatus();
    });
</script>

<main class={isAuthenticated !== null ? "visible" : ""}>
    {#if isAuthenticated}
        <DashboardPage />
    {:else}
        <LandingPage />
    {/if}
</main>

<style>
    :global(body) {
        margin: 0;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans,
            Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        background-color: white;
        color: black;
    }

    main {
        height: calc(100vh - 60px);
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity 0.5s ease;
        opacity: 0;
    }

    main.visible {
        opacity: 1;
    }
</style>
