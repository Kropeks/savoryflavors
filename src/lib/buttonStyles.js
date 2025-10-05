/**
 * Utility functions for dynamic button styling and hover effects
 */

// Extended color mapping with more Tailwind colors and their RGB values
const TAILWIND_COLORS = {
  // Grayscale
  white: { r: 255, g: 255, b: 255 },
  gray: {
    50: { r: 249, g: 250, b: 251 }, 100: { r: 243, g: 244, b: 246 },
    200: { r: 229, g: 231, b: 235 }, 300: { r: 209, g: 213, b: 219 },
    400: { r: 156, g: 163, b: 175 }, 500: { r: 107, g: 114, b: 128 },
    600: { r: 75, g: 85, b: 99 }, 700: { r: 55, g: 65, b: 81 },
    800: { r: 31, g: 41, b: 55 }, 900: { r: 17, g: 24, b: 39 },
  },
  // Green shades (matching SavoryFlavors theme)
  green: {
    50: { r: 240, g: 253, b: 244 }, 100: { r: 220, g: 252, b: 231 },
    200: { r: 187, g: 247, b: 208 }, 300: { r: 134, g: 239, b: 172 },
    400: { r: 74, g: 222, b: 128 }, 500: { r: 34, g: 197, b: 94 },
    600: { r: 22, g: 163, b: 74 }, 700: { r: 21, g: 128, b: 61 },
    800: { r: 22, g: 101, b: 52 }, 900: { r: 20, g: 83, b: 45 },
  },
  // Additional colors for variety
  red: {
    50: { r: 254, g: 242, b: 242 }, 100: { r: 254, g: 226, b: 226 },
    500: { r: 239, g: 68, b: 68 }, 600: { r: 220, g: 38, b: 38 },
    700: { r: 185, g: 28, b: 28 }
  },
  yellow: {
    50: { r: 255, g: 251, b: 235 }, 100: { r: 254, g: 243, b: 199 },
    400: { r: 250, g: 204, b: 21 }, 500: { r: 234, g: 179, b: 8 },
    600: { r: 202, g: 138, b: 4 }
  },
  blue: {
    50: { r: 239, g: 246, b: 255 }, 100: { r: 219, g: 234, b: 254 },
    500: { r: 59, g: 130, b: 246 }, 600: { r: 37, g: 99, b: 235 },
    700: { r: 29, g: 78, b: 216 }
  },
  // Add more colors as needed
};

/**
 * Get RGB values from a Tailwind color class
 */
function getRgbFromColorClass(colorClass) {
  if (!colorClass) return null;
  
  // Handle bg-opacity classes (e.g., 'bg-white/10')
  if (colorClass.includes('/')) {
    return { r: 255, g: 255, b: 255, a: 0.1 }; // Default for opacity variants
  }
  
  // Extract color and shade from class (e.g., 'bg-green-600' -> ['green', '600'])
  const colorMatch = colorClass.match(/bg-(\w+)(?:-(\d+))?/);
  if (!colorMatch) return null;
  
  const colorName = colorMatch[1];
  const shade = colorMatch[2] || '500';
  
  // Get RGB values from our color map
  const color = TAILWIND_COLORS[colorName]?.[parseInt(shade)] || 
               TAILWIND_COLORS.gray[500]; // Fallback to gray-500
  
  return color;
}

/**
 * Determine if a color is considered dark
 */
function isDarkColor(r, g, b) {
  // Calculate relative luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.6; // Threshold for dark colors
}

/**
 * Get appropriate text color (dark/light) based on background color
 */
export function getContrastTextColor(bgColor) {
  if (!bgColor) return 'text-gray-900 dark:text-white';
  
  const color = getRgbFromColorClass(bgColor);
  if (!color) return 'text-gray-900 dark:text-white';
  
  return isDarkColor(color.r, color.g, color.b) 
    ? 'text-white' 
    : 'text-gray-900';
}

/**
 * Generate dynamic hover effect based on button colors
 */
export function getHoverEffect(buttonClass, textClass = '') {
  // Extract base color from button class
  let baseColor = 'green';
  let shade = 600;
  let bgColor = '';
  
  // Extract background color class
  const bgMatch = buttonClass.match(/bg-(\w+)(?:-(\d+))?/);
  if (bgMatch) {
    baseColor = bgMatch[1];
    shade = bgMatch[2] || (baseColor === 'white' ? '' : '600');
    bgColor = `bg-${baseColor}${shade ? `-${shade}` : ''}`;
  }
  
  // Get RGB values for background color
  const bgRgb = getRgbFromColorClass(bgColor) || TAILWIND_COLORS.gray[200];
  const isBgDark = isDarkColor(bgRgb.r, bgRgb.g, bgRgb.b);
  
  // Determine hover background color (slightly darker/lighter)
  let hoverBgColor = '';
  if (bgColor.includes('white')) {
    hoverBgColor = 'bg-gray-100';
  } else if (bgColor.includes('black')) {
    hoverBgColor = 'bg-gray-800';
  } else if (bgColor.includes('transparent')) {
    hoverBgColor = 'bg-gray-100 dark:bg-gray-800';
  } else {
    // Calculate hover shade (darker for light colors, lighter for dark colors)
    const currentShade = parseInt(shade) || 500;
    let hoverShade;
    
    if (isBgDark) {
      // For dark backgrounds, go slightly lighter
      hoverShade = Math.max(100, currentShade - 200);
    } else {
      // For light backgrounds, go slightly darker
      hoverShade = Math.min(900, currentShade + 200);
    }
    
    hoverBgColor = `bg-${baseColor}-${hoverShade}`;
  }
  
  // Determine text hover color
  let textHover = '';
  if (textClass) {
    // If text class is provided, determine if it's light or dark
    const isDarkText = textClass.includes('gray-900') || 
                      textClass.includes('gray-800') || 
                      textClass.includes('black') || 
                      textClass.includes('gray-700');
    textHover = isDarkText ? 'text-gray-900' : 'text-white';
  } else {
    // Default to contrasting text color based on hover background
    textHover = getContrastTextColor(hoverBgColor);
  }
  
  // Determine ring color for focus state
  let ringColor = 'ring-gray-300';
  if (bgColor && !bgColor.includes('white') && !bgColor.includes('transparent')) {
    ringColor = `ring-${baseColor}-${Math.min(parseInt(shade) + 100, 900)}`;
  }
  
  // Determine ripple effect color
  let rippleColor = isBgDark ? 'bg-white/10' : 'bg-black/10';
  
  // Special case for outline buttons
  const isOutline = buttonClass.includes('border') && 
                   !buttonClass.includes('bg-') || 
                   buttonClass.includes('bg-transparent');
  
  if (isOutline) {
    // For outline buttons, use a subtle background on hover
    hoverBgColor = bgColor.includes('white') 
      ? 'bg-gray-50 dark:bg-gray-800' 
      : `${bgColor.replace('bg-', 'bg-opacity-10 ')}`;
    
    // Use the border color for the ripple effect
    const borderMatch = buttonClass.match(/border-(\w+)(?:-(\d+))?/);
    if (borderMatch) {
      const borderColor = borderMatch[1];
      rippleColor = `bg-${borderColor}-500/10`;
    }
  }
  
  return {
    base: `relative overflow-hidden transition-all duration-300 group ${buttonClass} ${textClass}`,
    hover: `hover:${hoverBgColor} hover:${textHover} hover:shadow-md hover:-translate-y-0.5`,
    focus: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 ${ringColor}`,
    active: 'active:scale-95',
    child: `absolute inset-0 w-0 h-0 transition-all duration-500 ease-out rounded-full ${rippleColor} group-hover:w-64 group-hover:h-64 group-hover:-ml-32 group-hover:-mt-32`,
    text: 'relative z-10',
    isOutline
  };
}

/**
 * Predefined button variants with SavoryFlavors theme
 */
export const buttonVariants = {
  // Primary button - Main call-to-action
  primary: {
    base: 'bg-green-600 text-white font-semibold',
    hover: 'hover:bg-green-700 hover:shadow-lg',
  },
  
  // Secondary button - Alternative to primary
  secondary: {
    base: 'bg-white text-green-700 border border-green-300 font-medium',
    hover: 'hover:bg-green-50 hover:border-green-400 hover:text-green-800',
  },
  
  // Danger button - Destructive actions
  danger: {
    base: 'bg-red-600 text-white font-semibold',
    hover: 'hover:bg-red-700 hover:shadow-lg',
  },
  
  // Outline button - Less prominent actions
  outline: {
    base: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 font-medium',
    hover: 'hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white',
  },
  
  // Ghost button - Subtle actions
  ghost: {
    base: 'bg-transparent text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  
  // Link button - Text links that look like buttons
  link: {
    base: 'bg-transparent text-green-600 dark:text-green-400 hover:underline',
    hover: 'hover:text-green-700 dark:hover:text-green-300',
  },
  
  // Special buttons for SavoryFlavors
  cta: {
    base: 'bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-md',
    hover: 'hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:-translate-y-0.5',
  },
  
  // Social buttons
  facebook: {
    base: 'bg-[#1877F2] text-white',
    hover: 'hover:bg-[#166FE5] hover:shadow-md',
  },
  
  google: {
    base: 'bg-white border border-gray-300 text-gray-700',
    hover: 'hover:bg-gray-50 hover:shadow-sm',
  },
  
  // Recipe action buttons
  save: {
    base: 'bg-amber-500 text-white',
    hover: 'hover:bg-amber-600 hover:shadow-md',
  },
  
  // Size variants
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};
