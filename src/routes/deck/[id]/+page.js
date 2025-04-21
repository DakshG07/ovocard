import { getDeck } from "$lib/db";
import { error as errorPage } from "@sveltejs/kit";

/** @typedef {import("$lib/types").Deck} Deck */
/** @typedef {import("$lib/types").Card} Card */

/** @type {import('./$types').PageLoad}
 * @returns {Promise<{ deck: Deck | null; cards: Card[] | null; deckId: string, error: unknown}>}
 */
export async function load({ params }) {
  let { deck, cards, error } = await getDeck(params.id);
  if (!deck || !cards || !params.id) {
    throw errorPage(404);
  }
  return {
    deck,
    cards,
    deckId: params.id,
    error,
  };
}
