import { getTrip } from '@/lib/mocks/transit';

export type SeatStatus = 'free' | 'occupied' | 'selected';

export type Seat = {
  id: string;
  row: number;
  col: number;
  label: string;
  status: SeatStatus;
  aisleAfter?: boolean;
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seededRand(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4_294_967_296;
  };
}

/**
 * Génère un plan de sièges déterministe pour un trip.
 * Layout : 2+2 colonnes (aisle central), N rangées. Sièges occupés = total - left,
 * distribution pseudo-aléatoire seedée par l'id du trip pour être stable.
 */
export function getSeatLayout(tripId: string): Seat[] {
  const trip = getTrip(tripId);
  if (!trip) return [];

  const rowsCount = Math.ceil(trip.seatsTotal / 4);
  const rand = seededRand(hashString(tripId));
  const occupiedSet = new Set<string>();

  const allIds: string[] = [];
  for (let r = 1; r <= rowsCount; r++) {
    for (let c = 0; c < 4; c++) {
      if (r * 4 - (3 - c) > trip.seatsTotal) continue;
      const label = `${r}${String.fromCharCode(65 + c)}`;
      allIds.push(label);
    }
  }

  const occupiedCount = Math.min(allIds.length - 1, trip.seatsTotal - trip.seatsLeft);
  const shuffled = [...allIds].sort(() => rand() - 0.5);
  for (let i = 0; i < occupiedCount; i++) occupiedSet.add(shuffled[i]);

  const seats: Seat[] = [];
  for (let r = 1; r <= rowsCount; r++) {
    for (let c = 0; c < 4; c++) {
      const seatNumberFromStart = (r - 1) * 4 + c + 1;
      if (seatNumberFromStart > trip.seatsTotal) continue;
      const label = `${r}${String.fromCharCode(65 + c)}`;
      seats.push({
        id: `${tripId}-${label}`,
        row: r,
        col: c,
        label,
        status: occupiedSet.has(label) ? 'occupied' : 'free',
        aisleAfter: c === 1,
      });
    }
  }
  return seats;
}
