<script>
    import { onMount } from "svelte";
    import { setupGoogleAuth, signUp } from "$lib/auth";
    import { returnToDash } from "$lib/utils";
    import { slide } from "svelte/transition";

    let ready = false;
    let email = "";
    let password = "";
    let confirmPassword = "";
    let username = "";
    let errorMessage = "";

    onMount(() => {
        setupGoogleAuth("signup_with", returnToDash);
        ready = true;
    });

    async function handleSubmit() {
        // Reset error message
        errorMessage = "";

        // Simple validation
        if (!username || !email || !password || !confirmPassword) {
            errorMessage = "Please fill in all fields";
            return;
        }

        if (password !== confirmPassword) {
            errorMessage = "Passwords do not match";
            return;
        }

        if (password.length < 8) {
            errorMessage = "Password must be at least 8 characters";
            return;
        }

        try {
            const result = await signUp(username, email, password);
            if (!result.success) {
                errorMessage = result.message;
                return;
            }

            returnToDash();
        } catch (err) {
            console.error("Unexpected error during signup:", err);
            errorMessage =
                "An unexpected error occurred. Please try again later.";
        }
    }
</script>

<main class={ready ? "visible" : ""}>
    <div class="signup-container">
        <h1>Sign Up</h1>
        <p>Time to finally lock in.</p>

        <form on:submit|preventDefault={handleSubmit}>
            {#if errorMessage}
                <div class="error-message" transition:slide>{errorMessage}</div>
            {/if}
            <div class="form-group">
                <label for="username">Username</label>
                <input
                    type="text"
                    id="username"
                    bind:value={username}
                    placeholder="Your username"
                    required
                />
            </div>

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
                    placeholder="At least 8 characters"
                    required
                />
            </div>

            <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input
                    type="password"
                    id="confirm-password"
                    bind:value={confirmPassword}
                    placeholder="Confirm your password"
                    required
                />
            </div>

            <button type="submit" class="signup-button">Sign Up</button>
            <div id="googleSignIn"></div>
        </form>

        <div class="login-link">
            Already have an account? <a href="/login">Log in</a>
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

    .signup-container {
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

    input {
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

    .signup-button {
        width: 100%;
        background-color: black;
        color: white;
        border: none;
        padding: 14px;
        font-size: 1rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        margin-bottom: 20px;
        transition:
            transform 0.2s ease,
            background-color 0.2s ease;
    }

    .signup-button:hover {
        transform: translateY(-2px);
        background-color: #333;
    }

    .signup-button:active {
        transform: translateY(1px);
    }

    .login-link {
        margin-top: 24px;
        text-align: center;
        font-size: 0.9rem;
        color: #555;
    }

    .login-link a {
        color: black;
        text-decoration: none;
        font-weight: 500;
    }

    .login-link a:hover {
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
