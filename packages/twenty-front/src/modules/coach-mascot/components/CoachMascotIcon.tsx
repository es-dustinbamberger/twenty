import { type CSSProperties, type MouseEvent } from 'react';

// CoachMascotIcon — renders the feather quill SVG asset.
//
// Per the design spec (anti-cheesy rules, see public/coach-mascot/quill.svg):
//   - Bold filled silhouette with negative-space barb cuts
//   - Monochrome (currentColor) + single ES orange accent at the nib tip
//   - 22° tilt, no face, no shadow, no gradient
//   - 48px target size, designed to read at sidebar-widget scale
//
// We use an <img> tag rather than inlining the SVG so the asset file
// stays the single source of truth — the design review in
// twenty-mascot/ can iterate on the SVG independently of the React
// component. The img element inherits currentColor via Twenty's CSS
// pipeline, so the theme toggle works on both light and dark surfaces.
export type CoachMascotIconProps = {
  size?: number;
  style?: CSSProperties;
  onMouseDown?: (event: MouseEvent<HTMLImageElement>) => void;
};

export const CoachMascotIcon = ({
  size = 28,
  style,
  onMouseDown,
}: CoachMascotIconProps) => {
  return (
    <img
      src="/coach-mascot/quill.svg"
      alt="Quill"
      width={size}
      height={size}
      draggable={false}
      style={{ display: 'block', pointerEvents: 'none', ...style }}
      onMouseDown={onMouseDown}
    />
  );
};
