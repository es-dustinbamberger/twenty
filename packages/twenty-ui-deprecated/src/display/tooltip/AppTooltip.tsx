import { css } from '@linaria/core';
// Stubbed react-tooltip for local Twenty build (package missing in node_modules
// on v2.14.3). The mascot and the main Twenty UI do not depend on the
// real AppTooltip behavior; restoring it is a yarn add react-tooltip@^5
// away. See: quill V1 build session note.
import { themeCssVariables } from '@ui/theme-constants';

export enum TooltipPosition {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
}

export enum TooltipDelay {
  noDelay = '0ms',
  shortDelay = '300ms',
  mediumDelay = '500ms',
  longDelay = '1000ms',
}

const appTooltipClass = css`
  backdrop-filter: ${themeCssVariables.blur.strong};
  background-color: ${themeCssVariables.color.transparent.gray11};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${themeCssVariables.boxShadow.light};
  color: ${themeCssVariables.grayScale.gray1};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  overflow: visible;
  padding: ${themeCssVariables.spacing[2]};
  word-break: break-word;
  z-index: ${themeCssVariables.lastLayerZIndex};
`;

export type AppTooltipProps = {
  className?: string;
  anchorSelect?: string;
  content?: string;
  children?: React.ReactNode;
  offset?: number;
  noArrow?: boolean;
  hidden?: boolean;
  place?: string;
  delay?: TooltipDelay;
  positionStrategy?: string;
  clickable?: boolean;
  width?: string;
  isOpen?: boolean;
};

// Stubbed: returns children directly. The mascot does not use AppTooltip.
export const AppTooltip = ({
  className,
  children,
  hidden = false,
}: AppTooltipProps) => {
  if (hidden) return null;
  return (
    <span className={className ?? appTooltipClass}>{children}</span>
  );
};
