import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

import { useCoachMascotOpenChat } from '@/coach-mascot/hooks/useCoachMascotOpenChat';
import { useNavigationDrawerExpanded } from '@/navigation/hooks/useNavigationDrawerExpanded';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  padding: ${({ isExpanded }) =>
    isExpanded
      ? `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} 0 0`
      : '0'};
  width: 100%;
`;

const StyledButton = styled.button<{
  isActive: boolean;
  isExpanded: boolean;
}>`
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: ${({ isExpanded }) => (isExpanded ? '16px' : '10px')};
  box-shadow: ${({ isActive }) =>
    isActive
      ? '0 0 0 2px rgba(253, 102, 0, 0.36), 0 6px 18px rgba(253, 102, 0, 0.22)'
      : '0 4px 12px rgba(0, 0, 0, 0.18)'};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${({ isExpanded }) => (isExpanded ? '82px' : '32px')};
  justify-content: center;
  overflow: hidden;
  padding: 0;
  transition:
    box-shadow calc(${themeCssVariables.animation.duration.fast} * 1s) ease,
    transform calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
  width: ${({ isExpanded }) => (isExpanded ? '92px' : '32px')};

  &:hover {
    box-shadow: ${({ isActive }) =>
      isActive
        ? '0 0 0 2px rgba(253, 102, 0, 0.5), 0 8px 22px rgba(253, 102, 0, 0.28)'
        : '0 6px 18px rgba(0, 0, 0, 0.22)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  width: 100%;
`;

export const CoachMascotNavigationButton = () => {
  const { pathname } = useLocation();
  const isExpanded = useNavigationDrawerExpanded();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const openChat = useCoachMascotOpenChat();

  if (pathname.startsWith('/settings')) {
    return null;
  }

  const isActive =
    isSidePanelOpened === true && sidePanelPage === SidePanelPages.AskAI;

  return (
    <StyledContainer isExpanded={isExpanded}>
      <StyledButton
        aria-label="Ask Quill"
        data-quill-mascot-ui="true"
        data-testid="coach-mascot-navigation-button"
        isActive={isActive}
        isExpanded={isExpanded}
        onClick={openChat}
        title="Ask Quill"
        type="button"
      >
        <StyledImage
          alt="Ask Quill"
          draggable={false}
          src="/coach-mascot/ask-quill-button.svg"
        />
      </StyledButton>
    </StyledContainer>
  );
};
