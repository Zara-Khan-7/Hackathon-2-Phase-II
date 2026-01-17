/**
 * Animation Utilities Library
 *
 * Reusable animation utilities for consistent motion design across the application.
 * All animations are hardware-accelerated (transform + opacity only) for 60fps performance.
 *
 * @module animations
 */

/**
 * Animation variant types for type-safe animation usage
 */
export type AnimationVariant =
  | "slide-in-right"
  | "slide-in-left"
  | "slide-up"
  | "slide-down"
  | "fade-in"
  | "fade-in-up"
  | "scale-in"
  | "bounce-in"
  | "typing-dot"
  | "press";

/**
 * Timing functions for consistent easing across animations
 */
export const easings = {
  /** Smooth, natural easing for most animations */
  smooth: "cubic-bezier(0.16, 1, 0.3, 1)",

  /** Bouncy, playful easing for emphasis */
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

  /** Standard ease-out for fades */
  easeOut: "ease-out",

  /** Standard ease-in for exits */
  easeIn: "ease-in",

  /** Ease in and out for symmetric animations */
  easeInOut: "ease-in-out",
} as const;

/**
 * Standard animation durations in milliseconds
 */
export const durations = {
  /** Fast animations (e.g., button presses) */
  fast: 100,

  /** Standard animations (e.g., fades, slides) */
  normal: 200,

  /** Moderate animations (e.g., page transitions) */
  moderate: 300,

  /** Slow animations (e.g., complex choreography) */
  slow: 400,

  /** Extra slow (e.g., emphasis animations) */
  slower: 600,
} as const;

/**
 * Animation delay utilities for staggered animations
 */
export const delays = {
  /** No delay */
  none: 0,

  /** Short delay for slight stagger */
  short: 100,

  /** Medium delay for noticeable stagger */
  medium: 200,

  /** Long delay for dramatic stagger */
  long: 300,
} as const;

/**
 * Get animation class name by variant
 *
 * @param variant - The animation variant to use
 * @returns The Tailwind CSS class name
 *
 * @example
 * ```tsx
 * <div className={getAnimationClass("slide-in-right")}>
 *   Content
 * </div>
 * ```
 */
export function getAnimationClass(variant: AnimationVariant): string {
  return `animate-${variant}`;
}

/**
 * Create staggered animation delay styles
 *
 * @param index - The index of the element in the list
 * @param baseDelay - Base delay in milliseconds
 * @param staggerDelay - Delay increment per item in milliseconds
 * @returns Style object with animation delay
 *
 * @example
 * ```tsx
 * {items.map((item, i) => (
 *   <div
 *     key={i}
 *     className="animate-slide-up"
 *     style={getStaggerDelay(i, 0, 100)}
 *   >
 *     {item}
 *   </div>
 * ))}
 * ```
 */
export function getStaggerDelay(
  index: number,
  baseDelay: number = 0,
  staggerDelay: number = 100
): React.CSSProperties {
  return {
    animationDelay: `${baseDelay + index * staggerDelay}ms`,
  };
}

/**
 * Combine multiple animation classes
 *
 * @param animations - Array of animation variants
 * @returns Combined class string
 *
 * @example
 * ```tsx
 * <div className={combineAnimations(["fade-in", "slide-up"])}>
 *   Content
 * </div>
 * ```
 */
export function combineAnimations(...animations: AnimationVariant[]): string {
  return animations.map(getAnimationClass).join(" ");
}

/**
 * Check if user prefers reduced motion
 * Hook to respect user accessibility preferences
 *
 * @returns true if user prefers reduced motion
 *
 * @example
 * ```tsx
 * const reducedMotion = usePrefersReducedMotion();
 * const animation = reducedMotion ? "" : "animate-slide-in";
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Transition class builders for common patterns
 */
export const transitions = {
  /** Smooth transform and opacity transition */
  smooth: "transition-smooth",

  /** Color transitions (background, text, border) */
  colors: "transition-colors-smooth",

  /** All properties transition (use sparingly) */
  all: "transition-all duration-200 ease-out",
} as const;

/**
 * Hover effect utilities
 */
export const hoverEffects = {
  /** Lift element on hover */
  lift: "hover-lift",

  /** Scale element on hover */
  scale: "hover-scale",
} as const;

/**
 * Common animation presets for typical UI patterns
 */
export const animationPresets = {
  /** Message appearing from the right (user message) */
  messageUser: "animate-slide-in-right",

  /** Message appearing from the left (assistant message) */
  messageAssistant: "animate-slide-in-left",

  /** Button press feedback */
  buttonPress: "active:scale-95 transition-transform duration-100",

  /** Loading spinner */
  spinner: "animate-spin",

  /** Typing indicator dot */
  typingDot: "animate-typing-dot",

  /** Empty state appearance */
  emptyState: "animate-fade-in-up",

  /** Error/Alert slide down */
  alert: "animate-slide-down",

  /** Success badge scale in */
  badge: "animate-scale-in",

  /** List item stagger */
  listItem: "animate-slide-up",
} as const;

/**
 * Performance optimization utilities
 */
export const performanceHints = {
  /**
   * Add will-change hint for animations
   * Use sparingly - only for elements that will definitely animate
   */
  willChange: "will-change-[transform,opacity]",

  /**
   * Force GPU acceleration
   * Promotes element to its own layer
   */
  gpuAccelerate: "transform-gpu",
} as const;

/**
 * Create a custom animation with inline styles
 * For one-off animations not in the design system
 *
 * @param keyframes - CSS keyframes string
 * @param duration - Duration in milliseconds
 * @param easing - Easing function
 * @returns Style object with animation
 *
 * @example
 * ```tsx
 * const customAnim = createCustomAnimation(
 *   "0% { opacity: 0 } 100% { opacity: 1 }",
 *   300,
 *   easings.smooth
 * );
 * ```
 */
export function createCustomAnimation(
  keyframes: string,
  duration: number = durations.normal,
  easing: string = easings.smooth
): React.CSSProperties {
  return {
    animation: `${keyframes} ${duration}ms ${easing}`,
  };
}

/**
 * Animation orchestration utilities
 */
export const orchestration = {
  /**
   * Calculate total animation time for staggered list
   *
   * @param itemCount - Number of items
   * @param itemDuration - Duration of each item's animation
   * @param staggerDelay - Delay between items
   * @param baseDelay - Initial delay before first item
   * @returns Total time in milliseconds
   */
  calculateStaggerDuration(
    itemCount: number,
    itemDuration: number,
    staggerDelay: number,
    baseDelay: number = 0
  ): number {
    return baseDelay + (itemCount - 1) * staggerDelay + itemDuration;
  },

  /**
   * Generate array of delay values for staggered animations
   *
   * @param count - Number of items
   * @param staggerDelay - Delay between items
   * @param baseDelay - Initial delay
   * @returns Array of delay values in milliseconds
   */
  generateStaggerDelays(
    count: number,
    staggerDelay: number = 100,
    baseDelay: number = 0
  ): number[] {
    return Array.from({ length: count }, (_, i) => baseDelay + i * staggerDelay);
  },
};

/**
 * Type-safe style props for animations
 */
export interface AnimationStyleProps {
  /** Animation delay in milliseconds */
  delay?: number;

  /** Animation duration in milliseconds */
  duration?: number;

  /** Animation easing function */
  easing?: keyof typeof easings;

  /** Animation iteration count */
  iterations?: number | "infinite";
}

/**
 * Generate animation style object from props
 *
 * @param props - Animation style properties
 * @returns React CSS properties object
 *
 * @example
 * ```tsx
 * <div style={getAnimationStyles({ delay: 100, duration: 300, easing: "smooth" })}>
 *   Content
 * </div>
 * ```
 */
export function getAnimationStyles(props: AnimationStyleProps): React.CSSProperties {
  const styles: React.CSSProperties = {};

  if (props.delay !== undefined) {
    styles.animationDelay = `${props.delay}ms`;
  }

  if (props.duration !== undefined) {
    styles.animationDuration = `${props.duration}ms`;
  }

  if (props.easing) {
    styles.animationTimingFunction = easings[props.easing];
  }

  if (props.iterations !== undefined) {
    styles.animationIterationCount = props.iterations;
  }

  return styles;
}
