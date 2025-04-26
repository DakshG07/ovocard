import { supabase } from "./supabase";

/** @typedef {import('./types').Deck} Deck */
/** @typedef {import('./types').Card} Card */

/**
 * Loads deck and card data from the database
 * @param {string} deckId - The ID of the deck to load
 * @returns {Promise<{deck: Deck, cards: Card[], error: null}|{deck: null, cards: null, error: unknown}>}
 */
export async function getDeck(deckId) {
  try {
    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;
    if (!deckData) throw new Error("Deck not found");

    let deck = deckData;

    // Fetch the cards for this deck
    const { data: cardsData, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", deckId)
      .order("position", { ascending: true });

    if (cardsError) throw cardsError;
    let cards = cardsData || [];

    return { deck, cards, error: null };
  } catch (err) {
    return { deck: null, cards: null, error: err };
  }
}

/**
 * Creates a copy of the deck and returns the created deck's ID.
 * @param {string} deckId - The ID of the deck to copy.
 * @returns {Promise<{id: string, error: null} | {id: null, error: unknown}>} The ID of the newly created deck.
 */
export async function copyDeck(deckId) {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!authData.user) throw new Error("User not found");

    const { user } = authData;

    const { data: deckData, error: deckError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", deckId)
      .single();

    if (deckError) throw deckError;
    if (!deckData) throw new Error("Deck not found");

    let deck = deckData;

    // Fetch the cards for this deck
    const { data: cardsData, error: cardsError } = await supabase
      .from("cards")
      .select("*")
      .eq("deck_id", deckId)
      .order("position", { ascending: true });

    if (cardsError) throw cardsError;
    let cards = cardsData || [];

    // Create a new deck with the same name and description
    const { data: newDeckData, error: newDeckError } = await supabase
      .from("decks")
      .insert({
        name: "Copy of " + deck.name,
        description: deck.description,
        user_id: user.id,
        is_public: deck.is_public,
      })
      .select();

    if (newDeckError) throw newDeckError;
    if (!newDeckData) throw new Error("Failed to create new deck");

    const newDeck = newDeckData[0];

    // Copy the cards to the new deck
    const { data: newCardsData, error: newCardsError } = await supabase
      .from("cards")
      .insert(
        cards.map((card) => ({
          term: card.term,
          definition: card.definition,
          position: card.position,
          deck_id: newDeck.id,
        })),
      );

    return { id: newDeck.id, error: null };
  } catch (err) {
    return { id: null, error: err };
  }
}

/**
 * Delete a deck and all its cards, returning null if successful.
 * @param {string} deckId
 * @returns {Promise<unknown | null>}
 */
export async function deleteDeck(deckId) {
  try {
    // Delete the deck
    const { error: deleteDeckError } = await supabase
      .from("decks")
      .delete()
      .eq("id", deckId)
      .select();

    console.log("deleted deck");

    if (deleteDeckError) throw deleteDeckError;

    // Delete the cards
    const { error: deleteCardsError } = await supabase
      .from("cards")
      .delete()
      .eq("deck_id", deckId);

    if (deleteCardsError) throw deleteCardsError;

    return null;
  } catch (err) {
    return err;
  }
}
