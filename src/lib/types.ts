export type Deck = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  is_public: boolean;
};

export type Card = {
  id: string;
  deck_id: string;
  term: string;
  definition: string;
  position: number;
};
