import { useCallback, useEffect, useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useCoachMascotDrag } from './hooks/useCoachMascotDrag';
import { useCoachMascotOpenChat } from './hooks/useCoachMascotOpenChat';
import {
  COACH_MASCOT_DEFAULT_POSITION,
  coachMascotPositionState,
  loadCoachMascotPosition,
  saveCoachMascotPosition,
} from './states/coachMascotPositionState';

const EQUIPMENTSHARE_ORANGE = '#FD6600';

// The mascot is rendered as a single button. We use inline style
// (not styled-components) for position to avoid any parent transform/
// filter creating a containing block for position:fixed. The
// button itself is borderless/transparent so only the feather icon
// is visible — no gray rectangle around it.
const buttonStyle = (offsetX: number, offsetY: number): React.CSSProperties => ({
  position: 'fixed',
  bottom: 8,
  right: 8,
  width: 64,
  height: 64,
  transform: `translate(${offsetX}px, ${offsetY}px)`,
  background: 'transparent',
  border: 'none',
  padding: 0,
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2147483647,
  userSelect: 'none',
  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25))',
  transition: 'filter 0.15s ease',
});

const buttonStyleOpen = (offsetX: number, offsetY: number): React.CSSProperties => ({
  ...buttonStyle(offsetX, offsetY),
  filter: 'drop-shadow(0 0 0 #FD6600) drop-shadow(0 4px 12px rgba(253, 102, 0, 0.4))',
});

const ICON_SIZE = 64;

export const CoachMascot = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const position = useAtomStateValue(coachMascotPositionState);
  const setPosition = useSetAtomState(coachMascotPositionState);
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const openChat = useCoachMascotOpenChat();
  const [hydrated, setHydrated] = useState(false);

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

  return (
    <button
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      aria-label="Open Quill"
      title="Quill"
      data-testid="coach-mascot"
      type="button"
      style={isSidePanelOpened ? buttonStyleOpen(position.x, position.y) : buttonStyle(position.x, position.y)}
    >
      <img
        src="/coach-mascot/quill.svg"
        alt="Quill"
        width={ICON_SIZE}
        height={ICON_SIZE}
        draggable={false}
        style={{ display: 'block', pointerEvents: 'none' }}
      />
    </button>
  );
};
