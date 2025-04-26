<script>
    import { onMount } from "svelte";
    import { checkAuthStatus } from "$lib/auth";
    import LandingPage from "$lib/components/LandingPage.svelte";
    import DashboardPage from "$lib/components/DashboardPage.svelte";
    import { isAuthError } from "@supabase/supabase-js";

    /** @type {boolean | null} */
    let isAuthenticated = $state(null);
    /** @type {boolean} */
    let isMobile = $state(false);

    // Check if device is mobile
    const checkMobile = () => {
        isMobile = window.innerWidth <= 768;
    };

    // Handle authentication check
    async function checkAuth() {
        isAuthenticated = await checkAuthStatus();
    }

    // Setup mobile detection
    function setupMobileDetection() {
        // Initial check
        checkMobile();

        // Add event listener
        window.addEventListener("resize", checkMobile);

        // Return cleanup function
        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }

    onMount(() => {
        // Check authentication
        checkAuth();

        // Setup mobile detection and get cleanup function
        return setupMobileDetection();
    });
</script>

<main
    class={isAuthenticated !== null ? "visible" : ""}
    class:mobile={isMobile && isAuthenticated}
>
    {#if isAuthenticated}
        <DashboardPage />
    {:else}
        <LandingPage />
    {/if}
</main>

<style>
    main {
        height: calc(100vh - 60px);
        display: flex;
        justify-content: center;
        margin-top: 80px;
        transition: opacity 0.5s ease;
        opacity: 0;
    }

    main.visible {
        opacity: 1;
    }

    /* Remove vertical centering for mobile when authenticated */
    main.mobile {
        margin-top: unset;
        height: auto;
        min-height: calc(100vh - 60px);
    }
</style>
