<script>
    import { page } from "$app/stores";
    
    $: is404 = $page.status === 404;
    $: errorMessage = is404 
        ? "The page you're looking for doesn't exist or has been moved."
        : "An unexpected error occurred. Please try again later.";
</script>

<main>
    <div class="error-container">
        <h1>{$page.status}</h1>
        <h2>{is404 ? "Page Not Found" : "Error"}</h2>
        <p>{errorMessage}</p>
        <a href="/" class="home-button">Back to Home</a>
    </div>
</main>

<style>
    main {
        min-height: calc(100vh - 60px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
    }

    .error-container {
        text-align: center;
        max-width: 600px;
    }

    h1 {
        font-size: 8rem;
        margin: 0;
        line-height: 1;
        color: #000;
    }

    h2 {
        font-size: 2rem;
        margin: 0;
        margin-top: 1rem;
    }

    p {
        color: #666;
        margin: 1rem 0 2rem;
        font-size: 1.1rem;
    }

    .home-button {
        display: inline-block;
        background-color: transparent;
        color: #000;
        border: 1px solid #000;
        padding: 12px 24px;
        border-radius: 4px;
        text-decoration: none;
        font-size: 1rem;
        transition: all 0.2s ease;
    }

    .home-button:hover {
        background-color: #000;
        color: #fff;
    }
</style> 