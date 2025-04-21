<script>
    import { onMount } from "svelte";
    import { checkAuthStatus, signOut } from "$lib/auth";
    let { children } = $props();

    /** @type {boolean?} */
    let isAuthenticated = $state(null);
    onMount(async () => {
        isAuthenticated = await checkAuthStatus();
    });
</script>

<svelte:head>
    <title>vocard.</title>
</svelte:head>

<nav>
    <div class="nav-container">
        <div class="logo"><a href="/">vocard.</a></div>
        <div class="nav-links">
            <a href="/">Home</a>
            {#if isAuthenticated === null}{:else if isAuthenticated}
                <a
                    onclick={async (e) => {
                        e.preventDefault();
                        await signOut();
                        window.location.reload();
                    }}
                    href="/"
                    class="login-btn">Sign Out</a
                >
            {:else}
                <a href="/login" class="login-btn">Log In</a>
            {/if}
        </div>
    </div>
</nav>

{@render children()}

<style>
    nav {
        width: 100%;
        height: 50px;
        border-bottom: 1px solid #eee;
    }

    .nav-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        padding: 0 20px;
    }

    .logo {
        font-weight: bold;
        font-size: 1.5rem;
    }

    .nav-links {
        display: flex;
        gap: 20px;
        align-items: center;
    }

    .nav-links a {
        text-decoration: none;
        color: black;
        display: inline-flex;
        align-items: center;
    }

    .login-btn {
        background-color: black;
        color: white !important;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 0.9rem;
        transition:
            background-color 0.3s ease,
            transform 0.3s ease;
    }
    .login-btn:hover {
        background-color: #333;
    }
    .login-btn:active {
        transform: scale(0.95);
    }
    .nav-links a {
        text-decoration: none;
        color: black;
    }

    .logo a {
        text-decoration: none;
        color: black;
    }
</style>
