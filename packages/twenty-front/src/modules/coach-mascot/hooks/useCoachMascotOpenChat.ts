import { useCallback } from 'react';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { IconPencil } from 'twenty-ui/display';
import { SidePanelPages } from 'twenty-shared/types';

// Opens the existing Ask AI side panel with the Quill agent selected.
//
// Phase 1 acceptance (DESIGN_twenty_system_of_record.md:77) requires
// clicking the mascot to "open the existing Ask AI chat with Quill
// selected". Agent selection itself is role-based — when Quill is bound
// to the user's role via `AiAgentRoleService`, every chat thread they
// open uses Quill automatically. So this hook only needs to navigate
// to the Ask AI side panel; the chat surface handles the rest.
export const useCoachMascotOpenChat = () => {
  const { navigateSidePanelMenu } = useSidePanelMenu();

  return useCallback(() => {
    navigateSidePanelMenu({
      page: SidePanelPages.AskAI,
      pageTitle: 'Quill',
      pageIcon: IconPencil,
      resetNavigationStack: true,
    });
  }, [navigateSidePanelMenu]);
};
