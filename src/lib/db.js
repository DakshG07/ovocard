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
