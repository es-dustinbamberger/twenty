import { type CSSProperties, type MouseEvent } from 'react';
import { motion } from 'framer-motion';

type CoachMascotIconProps = {
  size?: number;
  style?: CSSProperties;
  onMouseDown?: (event: MouseEvent<SVGSVGElement>) => void;
};

// Modernized paperclip — V1 placeholder concept.
//
// Per the design spec (anti-cheesy rules):
//   - Single closed stroke, asymmetric tilt (-12°) suggests motion
//   - Monochrome (currentColor); no face, no mouth, no eyes
//   - No 3D bevel, no shadow, no gradient, no glow
//   - Rounded line caps and joins for industrial feel
//
// The chosen concept variant (after user design review) replaces this
// file. The shape should NOT change to include any anthropomorphic
// features — see DESIGN_twenty_system_of_record.md guardrails on the
// mascot icon and the agent brief's anti-cheesy checklist.
export const CoachMascotIcon = ({
  size = 48,
  style,
  onMouseDown,
}: CoachMascotIconProps) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      style={{ display: 'block', ...style }}
      aria-hidden="true"
      onMouseDown={onMouseDown}
    >
      <g transform="rotate(-12 24 24)">
        <path
          d="M 14 14 L 14 36 Q 14 40 18 40 L 28 40 Q 34 40 34 34 L 34 14 Q 34 10 30 10 L 22 10 Q 18 10 18 14 L 18 32"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </motion.svg>
  );
};