// Purpose: Describe candidate generation and public-data join decisions.
import type { JevProvider } from "./jev.mjs";
export function normalizeName(value: unknown): string;
export function candidates(
  left: Record<string, any>[],
  right: Record<string, any>[],
  options?: { idKeys?: string[]; maxCandidates?: number },
): any[];
export function joinRows(
  left: Record<string, any>[],
  right: Record<string, any>[],
  provider: JevProvider,
  options?: {
    idKeys?: string[];
    maxCandidates?: number;
    minConfidence?: number;
  },
): Promise<any[]>;
export function runCli(
  argv: string[],
  io?: { log(value: string): void },
): Promise<void>;
