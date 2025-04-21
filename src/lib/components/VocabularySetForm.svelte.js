/* Keep the shared state in here */

export let data = $state({
  deckName: "",
  deckDescription: "",
  isPublic: true,
  isSubmitting: false,
  errorMessage: "",
  successMessage: "",
  /** @type {Array<{id: number, term: string, definition: string}>} */
  cards: [
    { id: 1, term: "", definition: "" },
    { id: 2, term: "", definition: "" },
  ],
});
