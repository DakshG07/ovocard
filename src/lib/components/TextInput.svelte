<script>
    /**
     * @type {CustomEvent<string>}
     */
    import { fly } from "svelte/transition";

    /**
     * @type {{term: string, hints: number, disabled: boolean, onsubmit: Function}}
     */
    let { term, hints = 3, disabled = false, onsubmit } = $props();

    let buttonActive = $state(false);

    /**
     * @typedef {Object} InputBox
     * @property {number} index - The index of the box
     * @property {string} hint - The hint at this position
     * @property {string} value - The current value in the box
     */

    // Generate boxes with hints
    /** @type {InputBox[]} */
    let boxes = $derived.by(() => {
        let terms = term.split("").map((letter, index) => ({
            index,
            hint: "",
            value: "",
        }));
        for (let i = 0; i < hints; i++) {
            let idx = Math.floor(Math.random() * term.length);
            if (!terms[idx].hint) {
                terms[idx].hint = term[idx];
            } else {
                i--;
            }
        }
        /** @type {HTMLInputElement} */ (
            document.querySelector(".dummy")
        )?.focus();
        return terms;
    });
    /** @type {boolean} */
    let isComplete = $derived(boxes.every((box) => box.value));

    /**
     * Handle keydown events for navigation between boxes
     * @param {KeyboardEvent} event - The keyboard event
     * @param {number} index - The index of the current box
     */
    function handleKeydown(event, index) {
        if (event.key === "Backspace") {
            boxes[index].value = "";
            if (index > 0) {
                const prevBox = /** @type {HTMLInputElement} */ (
                    document.querySelector(`input[data-index="${index - 1}"]`)
                );
                if (prevBox) prevBox.focus();
            }
        } else if (/^[a-zA-z]$/.test(event.key)) {
            if (index < boxes.length - 1) {
                let type_idx = index;
                if (boxes[index].value.length === 1) type_idx++;
                boxes[type_idx].value = event.key;
                boxes = boxes;
                // Move to next box after typing a character
                const nextBox = /** @type {HTMLInputElement} */ (
                    document.querySelector(`input[data-index="${index + 1}"]`)
                );
                if (nextBox) nextBox.focus();
            } else {
                boxes[index].value = event.key;
                boxes = boxes;
            }
        }
        event.preventDefault();
    }

    /**
     * @param {KeyboardEvent} event - The keyboard event
     */
    function handleGlobalKeydown(event) {
        if (event.key === "Enter" && isComplete) {
            buttonActive = true;
        } else if (/^[a-zA-Z]$/.test(event.key)) {
            if (
                !document.activeElement ||
                !document.activeElement.matches(".letter-input")
            ) {
                handleKeydown(event, 0);
            }
        }
    }

    /**
     * @param {KeyboardEvent} event - The keyboard event
     */
    function handleGlobalKeyup(event) {
        if (event.key === "Enter" && isComplete) {
            buttonActive = false;
            submit();
        }
    }

    function submit() {
        onsubmit(boxes.reduce((word, box) => word + box.value, ""));
    }
</script>

<svelte:window onkeydown={handleGlobalKeydown} onkeyup={handleGlobalKeyup} />

<div class="text-input-container">
    {#each boxes as box, i}
        <div
            class="input-box {box.hint ? 'hint' : ''} {box.value
                ? 'complete'
                : ''} {isComplete ? 'finished' : ''}"
        >
            <input
                type="text"
                maxlength="1"
                value={box.value}
                placeholder={box.hint}
                onkeydown={(e) => handleKeydown(e, i)}
                data-index={i}
                class="letter-input"
            />
        </div>
    {/each}
</div>

{#if isComplete}
    <div
        class="submit-container"
        transition:fly={{
            duration: 200,
            y: 20,
            easing: (t) => --t * t * t + 1,
        }}
    >
        <button
            class="submit-button {buttonActive ? 'active' : ''}"
            onclick={submit}
        >
            Submit
        </button>
        <div class="submit-hint">(or press enter)</div>
    </div>
{/if}

<input class="dummy" style="opacity: 0;" />

<style>
    .text-input-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin: 20px 0;
        width: 100%;
        max-width: 100%;
    }

    .input-box {
        width: 40px;
        height: 40px;
        border: 2px solid #ddd;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        transition: transform 0.1s ease;
        flex-shrink: 0;
    }

    .input-box.hint {
        background-color: #f0f0f0;
        border-color: #aaa;
    }

    .input-box.complete {
        border-color: #4caf50;
        background-color: #e8f5e9;
    }

    .input-box.hint.complete {
        background-color: #b7d6b8;
        border-color: #2e7d32;
    }

    .input-box:has(.letter-input:focus),
    .input-box.finished {
        transform: translateY(-10px);
    }

    .letter-input {
        width: 100%;
        height: 100%;
        text-align: center;
        font-size: 1.2rem;
        border: none;
        background: transparent;
        text-transform: uppercase;
    }

    .letter-input:focus {
        outline: none;
    }

    .submit-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 10px;
    }

    .submit-button {
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 2px solid #4caf50;
        border-radius: 6px;
        padding: 10px 20px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .submit-button:hover {
        background-color: #b7d6b8;
        border-color: #2e7d32;
        transform: translateY(-2px);
    }

    .submit-button:active,
    .submit-button.active {
        background-color: #b7d6b8;
        border-color: #2e7d32;
        transform: translateY(2px);
    }

    .submit-hint {
        font-size: 0.8rem;
        color: #666;
        margin-top: 5px;
    }

    @media (max-width: 768px) {
        .input-box {
            width: 35px;
            height: 35px;
            border-width: 1.5px;
        }
    }
</style>
