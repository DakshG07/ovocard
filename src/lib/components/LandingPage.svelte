<script>
    // Landing page component
</script>

<div class="container">
    <h1>ovocard.</h1>
    <p>Vocabulary made easy.</p>
    <a href="/signup"><button class="button dark-button">Sign Up</button></a>
    <a href="/login"><button class="button light-button">Log In</button></a>
</div>

<style>
    .container {
        text-align: center;
    }

    h1 {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }

    p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        color: #555;
    }

    .button {
        padding: 12px 24px;
        font-size: 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition:
            transform 0.2s ease,
            background-color 0.2s ease;
    }

    .button:hover {
        transform: translateY(-2px);
    }

    .button:active {
        transform: translateY(2px);
    }

    .dark-button {
        background-color: black;
        color: white;
        border: none;
    }

    .dark-button:hover {
        background-color: #333;
    }

    .light-button {
        background-color: white;
        color: black;
        border: 1px solid #ccc;
        margin: 0 5px;
    }

    .light-button:hover {
        background-color: #eee;
    }
</style>