import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// CoachMascotPosition — pixel offset from the dock position
// (bottom-right by default, set via CSS). Positive x moves the mascot
// to the left; positive y moves it up. The user can drag freely.
export type CoachMascotPosition = {
  x: number;
  y: number;
};

export const COACH_MASCOT_DEFAULT_POSITION: CoachMascotPosition = {
  x: 0,
  y: 0,
};

// Local-storage key prefix for persisted mascot position. Per
// DESIGN_twenty_system_of_record.md:75 — persisted per user, scoped by
// workspace member id so multiple members on the same browser each get
// their own placement.
export const COACH_MASCOT_POSITION_STORAGE_KEY_PREFIX =
  'quill-mascot-position-';

export const coachMascotPositionState = createAtomState<CoachMascotPosition>({
  key: 'coach-mascot/coachMascotPositionState',
  defaultValue: COACH_MASCOT_DEFAULT_POSITION,
});

export const loadCoachMascotPosition = (
  workspaceMemberId: string | null | undefined,
): CoachMascotPosition => {
  if (typeof window === 'undefined' || !workspaceMemberId) {
    return COACH_MASCOT_DEFAULT_POSITION;
  }
  try {
    const raw = window.localStorage.getItem(
      `${COACH_MASCOT_POSITION_STORAGE_KEY_PREFIX}${workspaceMemberId}`,
    );
    if (!raw) return COACH_MASCOT_DEFAULT_POSITION;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'x' in parsed &&
      'y' in parsed &&
      typeof (parsed as { x: unknown }).x === 'number' &&
      typeof (parsed as { y: unknown }).y === 'number' &&
      Number.isFinite((parsed as { x: number }).x) &&
      Number.isFinite((parsed as { y: number }).y)
    ) {
      return parsed as CoachMascotPosition;
    }
  } catch {
    // fall through to default
  }
  return COACH_MASCOT_DEFAULT_POSITION;
};

export const saveCoachMascotPosition = (
  workspaceMemberId: string | null | undefined,
  position: CoachMascotPosition,
): void => {
  if (typeof window === 'undefined' || !workspaceMemberId) return;
  try {
    window.localStorage.setItem(
      `${COACH_MASCOT_POSITION_STORAGE_KEY_PREFIX}${workspaceMemberId}`,
      JSON.stringify(position),
    );
  } catch {
    // ignore quota / privacy errors
  }
};