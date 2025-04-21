<script>
    /**
     * @type {CustomEvent<string>}
     */
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    /**
     * @type {{term: string, hints: number, disabled: boolean}}
     */
    let { term, hints = 3, disabled = false } = $props();

    /**
     * @typedef {Object} InputBox
     * @property {number} index - The index of the box
     * @property {string} letter - The letter at this position
     * @property {string} hint - The hint at this position
     * @property {string} value - The current value in the box
     */

    // Generate boxes with hints
    /** @type {InputBox[]} */
    let boxes = $derived.by(() => {
        let terms = term.split("").map((letter, index) => ({
            index,
            letter,
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
        return terms;
    });
    /** @type {boolean} */
    let isComplete = $state(false);

    // /**
    //  * Handle input change
    //  * @param {Event} event - The input event
    //  * @param {number} index - The index of the box
    //  */
    // function handleInput(event, index) {
    //     const target = /** @type {HTMLInputElement} */ (event.target);
    //     const value = target.value;
    //     if (value.length <= 1) {
    //         userInput[index] = value;
    //         boxes[index].value = value;

    //         // Check if all boxes are filled
    //         if (userInput.every((input) => input !== "")) {
    //             isComplete = true;
    //             dispatch("complete", { value: userInput.join("") });
    //         }
    //     }
    // }

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
</script>

<div class="text-input-container">
    {#each boxes as box, i}
        <div
            class="input-box {box.hint ? 'hint' : ''} {box.value
                ? 'complete'
                : ''}"
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

<style>
    .text-input-container {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin: 20px 0;
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

    .input-box:has(.letter-input:focus) {
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
</style>
