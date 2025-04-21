<script>
    import { onMount } from "svelte";
    import { setupGoogleAuth, signIn } from "$lib/auth";
    import { returnToDash } from "$lib/utils";
    import { slide } from "svelte/transition";

    let ready = false;
    let email = "";
    let password = "";
    let rememberMe = false;
    let errorMessage = "";

    onMount(() => {
        setupGoogleAuth("signin_with", returnToDash);
        ready = true;
    });

    async function handleSubmit() {
        // Reset error message
        errorMessage = "";

        // Simple validation
        if (!email || !password) {
            errorMessage = "Please fill in all fields";
            return;
        }

        try {
            const result = await signIn(email, password);
            if (!result.success) {
                errorMessage = result.message;
                return;
            }

            returnToDash();
        } catch (err) {
            console.error("Unexpected error during login:", err);
            errorMessage =
                "An unexpected error occurred. Please try again later.";
        }
    }
</script>

<main class={ready ? "visible" : ""}>
    <div class="login-container">
        <h1>Log In</h1>
        <p>Welcome back.</p>

        <form on:submit|preventDefault={handleSubmit}>
            {#if errorMessage}
                <div class="error-message" transition:slide>{errorMessage}</div>
            {/if}

            <div class="form-group">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    placeholder="your@email.com"
                    required
                />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    placeholder="Your password"
                    required
                />
            </div>

            <button type="submit" class="login-button">Log In</button>
            <div id="googleSignIn"></div>
        </form>

        <div class="signup-link">
            Don't have an account? <a href="/signup">Sign up</a>
        </div>
    </div>
</main>

<style>
    main {
        min-height: calc(100vh - 60px);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.5s ease;
        padding: 40px 20px;
    }

    main.visible {
        opacity: 1;
    }

    .login-container {
        width: 100%;
        max-width: 420px;
        padding: 40px;
    }

    h1 {
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
        text-align: center;
    }

    p {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        color: #555;
        text-align: center;
    }

    .form-group {
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.9rem;
        font-weight: 500;
    }

    input[type="email"],
    input[type="password"] {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    input:focus {
        outline: none;
        border-color: #000;
    }

    .login-button {
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
        margin-bottom: 20px;
    }

    .login-button:hover {
        transform: translateY(-2px);
        background-color: #333;
    }

    .login-button:active {
        transform: translateY(1px);
    }

    .signup-link {
        margin-top: 24px;
        text-align: center;
        font-size: 0.9rem;
        color: #555;
    }

    .signup-link a {
        color: black;
        text-decoration: none;
        font-weight: 500;
    }

    .signup-link a:hover {
        text-decoration: underline;
    }

    .error-message {
        background-color: #fff3f3;
        color: #e53935;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
        font-size: 0.9rem;
    }
</style>
