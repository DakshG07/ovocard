import { getDeck } from "$lib/db";
import { error as report } from "@sveltejs/kit";

/** @typedef {import("$lib/types").Deck} Deck */
/** @typedef {import("$lib/types").Card} Card */

/** @type {import('./$types').PageLoad}
 * @returns {Promise<{ deck: Deck | null; cards: Card[] | null; deckId: string }>}
 */
export async function load({ params }) {
  let { deck, cards, error } = await getDeck(params.id);
  if (error) {
    console.error("Error loading deck data:", error);
    throw report(404);
  }
  return {
    deck,
    cards,
    deckId: params.id,
  };
}
