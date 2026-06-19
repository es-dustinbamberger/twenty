import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { styled } from '@linaria/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CoachMascotIcon } from './components/CoachMascotIcon';
import { useCoachMascotDrag } from './hooks/useCoachMascotDrag';
import { useCoachMascotOpenChat } from './hooks/useCoachMascotOpenChat';
import {
  COACH_MASCOT_DEFAULT_POSITION,
  coachMascotPositionState,
  loadCoachMascotPosition,
  saveCoachMascotPosition,
} from './states/coachMascotPositionState';

const EQUIPMENTSHARE_ORANGE = '#FD6600';

const StyledMascotButton = styled(motion.button)<{ offsetX: number; offsetY: number }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  bottom: ${themeCssVariables.spacing[3]};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  color: ${themeCssVariables.font.color.tertiary};
  cursor: grab;
  display: flex;
  height: 48px;
  justify-content: center;
  padding: 0;
  position: fixed;
  right: ${themeCssVariables.spacing[3]};
  transform: translate(${({ offsetX }) => offsetX}px, ${({ offsetY }) => offsetY}px);
  transition:
    color 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
  user-select: none;
  width: 48px;
  z-index: 50;

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
    color: ${themeCssVariables.font.color.secondary};
  }

  &:focus-visible {
    border-color: ${EQUIPMENTSHARE_ORANGE};
    outline: none;
  }

  &:active {
    cursor: grabbing;
  }
`;

const StyledMascotButtonOpen = styled(StyledMascotButton)`
  border-color: ${EQUIPMENTSHARE_ORANGE};
  color: ${EQUIPMENTSHARE_ORANGE};
`;

// CoachMascot — the floating Quill launcher.
//
// Phase 1 states only: Idle, Hover (via :hover CSS), Dragging, ChatOpen.
// Phase 2+ adds: Observing, Nudge, Alert (see anti-cheesy escalation
// ladder in DESIGN_twenty_system_of_record.md:81).
//
// The mascot is fixed-position, default-docked to the bottom-right.
// Click opens the existing Ask AI side panel (Quill agent dispatch is
// role-based; see spike result). Drag repositions freely with
// per-workspace-member persistence in localStorage.
export const CoachMascot = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const position = useAtomStateValue(coachMascotPositionState);
  const setPosition = useSetAtomState(coachMascotPositionState);
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const openChat = useCoachMascotOpenChat();
  const reducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount. Skip rendering until hydrated
  // so the user doesn't see a position flash from (0,0) → persisted.
  useEffect(() => {
    setPosition(
      loadCoachMascotPosition(currentWorkspaceMember?.id) ??
        COACH_MASCOT_DEFAULT_POSITION,
    );
    setHydrated(true);
  }, [currentWorkspaceMember?.id, setPosition]);

  const handleDelta = useCallback(
    (dx: number, dy: number) => {
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [setPosition],
  );

  const handleDragEnd = useCallback(() => {
    saveCoachMascotPosition(currentWorkspaceMember?.id, position);
  }, [currentWorkspaceMember?.id, position]);

  const { isDragging, handleMouseDown } = useCoachMascotDrag({
    onDelta: handleDelta,
    onDragEnd: handleDragEnd,
  });

  const handleClick = useCallback(() => {
    if (!isDragging) openChat();
  }, [isDragging, openChat]);

  if (!hydrated) return null;

  const Button = isSidePanelOpened ? StyledMascotButtonOpen : StyledMascotButton;

  return (
    <Button
      offsetX={position.x}
      offsetY={position.y}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      aria-label="Open Quill"
      title="Quill"
      data-testid="coach-mascot"
      type="button"
      animate={reducedMotion ? undefined : { scale: isDragging ? 1.05 : 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      <CoachMascotIcon size={28} />
    </Button>
  );
};