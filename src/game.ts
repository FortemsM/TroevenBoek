/** The score model is independent from the screens, so scoring can evolve safely. */
export type GameId = 'kleurenwiezen' | 'kingen' | 'poepen';
export type Round = { id: string; game: GameId; contract: string; points: number[]; bids?: number[]; tricks?: number[] };
export type Session = { id: string; name: string; game: GameId; players: string[]; rounds: Round[]; created: string; finished: boolean; maxCards: number };
export const games: { id: GameId; name: string; suit: string; description: string; detail: string; color: string; tint: string }[] = [
  { id: 'kleurenwiezen', name: 'Kleurenwiezen', suit: '♠', description: 'Een klassieker aan elke kaarttafel.', detail: '4 spelers · contracten', color: '#245441', tint: '#e7eee6' },
  { id: 'kingen', name: 'Kingen', suit: '♥', description: 'Elk contract een nieuwe uitdaging.', detail: '4 spelers · punten', color: '#b85543', tint: '#faeae4' },
  { id: 'poepen', name: 'Chinees Poepen', suit: '♣', description: 'Voorspel je slagen. Houd je hoofd koel.', detail: '3–8 spelers · strafpunten', color: '#95742d', tint: '#f5efdb' },
];
export const contracts: Record<GameId, string[]> = {
  kleurenwiezen: ['Vraag & Mee', 'Alleen', 'Abondance', 'Misère', 'Picolo', 'Solo', 'Solo Slim', 'Troel'],
  kingen: ['Geen slagen', 'Geen harten', 'Geen heren / boeren', 'Geen dames', 'Geen hartenheer', 'Laatste twee', 'Troef'],
  poepen: ['Exact voorspellen'],
};
export function totals(session: Session): number[] { return session.players.map((_, i) => session.rounds.reduce((sum, r) => sum + r.points[i], 0)); }
export function cardsForRound(round: number, max: number): number { const position = round % (2 * max - 2); return max - (position < max ? position : 2 * max - 2 - position); }
export function validatePoints(game: GameId, points: number[]): string | null {
  if (points.some(p => !Number.isSafeInteger(p) || Math.abs(p) > 100000)) return 'Vul voor elke speler een geldig geheel getal in (max. 100.000).';
  if (game === 'kleurenwiezen' && points.reduce((a, b) => a + b, 0) !== 0) return 'Bij Kleurenwiezen moet de som van de punten 0 zijn.';
  return null;
}
export function exactBidPoints(bids: number[], tricks: number[], cards: number): number[] {
  if (bids.length !== tricks.length || bids.some(n => !Number.isInteger(n) || n < 0 || n > cards) || tricks.some(n => !Number.isInteger(n) || n < 0 || n > cards)) throw new Error(`Vul voorspellingen en slagen in van 0 tot ${cards}.`);
  if (tricks.reduce((a, b) => a + b, 0) !== cards) throw new Error(`Het totaal aantal behaalde slagen moet ${cards} zijn.`);
  return bids.map((bid, i) => bid === tricks[i] ? 0 : 1);
}
/** Validate persisted data before rendering; damaged storage is never overwritten. */
export function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const s = value as Session;
  if (typeof s.id !== 'string' || !s.id || typeof s.name !== 'string' || !games.some(g => g.id === s.game)
    || !Array.isArray(s.players) || s.players.length < 3 || s.players.length > 8
    || (s.game !== 'poepen' && s.players.length !== 4)
    || !s.players.every(p => typeof p === 'string' && p.trim().length > 0)
    || new Set(s.players.map(p => p.trim().toLocaleLowerCase())).size !== s.players.length
    || !Array.isArray(s.rounds) || typeof s.finished !== 'boolean'
    || typeof s.created !== 'string' || !Number.isFinite(Date.parse(s.created))
    || !Number.isInteger(s.maxCards) || s.maxCards < 2 || s.maxCards > Math.floor(52 / s.players.length)) return false;
  const valid = s.rounds.every((r, index) => {
    if (!r || typeof r !== 'object' || typeof r.id !== 'string' || !r.id || r.game !== s.game
      || typeof r.contract !== 'string' || !contracts[s.game].includes(r.contract)
      || !Array.isArray(r.points) || r.points.length !== s.players.length || validatePoints(s.game, r.points)) return false;
    if (s.game === 'poepen') {
      if (!Array.isArray(r.bids) || !Array.isArray(r.tricks) || r.bids.length !== s.players.length) return false;
      try { return exactBidPoints(r.bids, r.tricks, cardsForRound(index, s.maxCards)).every((p, i) => p === r.points[i]); }
      catch { return false; }
    }
    return true;
  });
  return valid && new Set(s.rounds.map(r => r.id)).size === s.rounds.length;
}
