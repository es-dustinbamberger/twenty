import { fireEvent, render, screen } from '@testing-library/react';

import { CoachMascotNavigationButton } from '@/coach-mascot/components/CoachMascotNavigationButton';

const mockOpenChat = jest.fn();
let mockPathname = '/objects/companies';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}));

jest.mock('@/coach-mascot/hooks/useCoachMascotOpenChat', () => ({
  useCoachMascotOpenChat: () => mockOpenChat,
}));

jest.mock('@/navigation/hooks/useNavigationDrawerExpanded', () => ({
  useNavigationDrawerExpanded: () => true,
}));

describe('CoachMascotNavigationButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/objects/companies';
  });

  it('renders the Ask Quill button artwork and opens Quill when clicked', () => {
    render(<CoachMascotNavigationButton />);

    const button = screen.getByRole('button', { name: 'Ask Quill' });
    const image = screen.getByRole('img', { name: 'Ask Quill' });

    expect(image).toHaveAttribute(
      'src',
      '/coach-mascot/ask-quill-button.svg',
    );

    fireEvent.click(button);

    expect(mockOpenChat).toHaveBeenCalledTimes(1);
  });

  it('does not render on settings pages', () => {
    mockPathname = '/settings/profile';

    render(<CoachMascotNavigationButton />);

    expect(
      screen.queryByRole('button', { name: 'Ask Quill' }),
    ).not.toBeInTheDocument();
  });
});
