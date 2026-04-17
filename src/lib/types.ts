export type Participant = Record<string, string>;

export interface Prize {
  id: string;
  name: string;
  winner?: Participant;
}
