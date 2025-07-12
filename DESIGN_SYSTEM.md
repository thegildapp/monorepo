# Gild Design System

A monochrome, editorial-inspired design system built for clean, functional interfaces.

## Design Philosophy

### Core Principles
- **Monochrome First**: Pure blacks, whites, and grays only
- **Editorial Heritage**: Newspaper/magazine typography principles
- **Functional Minimalism**: No unnecessary visual elements
- **Content-Focused**: Design serves content, not the other way around

### Visual Language
- **No Cards**: Use inset views with borders instead of elevated cards
- **No Shadows**: Avoid drop shadows and elevation effects
- **Typography Hierarchy**: Use size and weight, not color, for emphasis
- **Clean Separations**: Subtle borders and dividers instead of backgrounds

## Color Palette

### Monochrome Scale
```css
--color-black: #000000           /* Primary brand, buttons, text */
--color-gray-900: #111111        /* Primary text */
--color-gray-800: #1f1f1f        /* Hover states */
--color-gray-700: #2d2d2d        /* Secondary elements */
--color-gray-600: #404040        /* Secondary text */
--color-gray-500: #525252        /* Tertiary text */
--color-gray-400: #737373        /* Muted text, placeholders */
--color-gray-300: #a3a3a3        /* Disabled text */
--color-gray-200: #d4d4d4        /* Borders, dividers */
--color-gray-100: #e5e5e5        /* Light borders */
--color-gray-50: #f5f5f5         /* Surface backgrounds */
--color-white: #ffffff           /* Primary background */
```

### Semantic Colors
```css
--color-text-primary: var(--color-gray-900)
--color-text-secondary: var(--color-gray-600)
--color-text-muted: var(--color-gray-400)
--color-background: var(--color-white)
--color-border: var(--color-gray-200)
--color-accent: var(--color-black)
```

## Typography

### Font Family
- **Primary**: `'Tinos', serif` (Google Fonts)
- **Style**: Editorial, newspaper-inspired serif
- **Weights**: 400 (normal), 700 (bold)

### Scale
```css
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.125rem    /* 18px */
--font-size-xl: 1.25rem     /* 20px */
--font-size-2xl: 1.5rem     /* 24px */
--font-size-3xl: 1.875rem   /* 30px */
--font-size-4xl: 2.25rem    /* 36px */
```

### Hierarchy
- **H1**: 36px, normal weight
- **H2**: 30px, normal weight  
- **H3**: 24px, normal weight
- **H4**: 20px, normal weight
- **Body**: 16px, normal weight
- **Caption**: 14px, normal weight
- **Small**: 12px, normal weight

## Spacing System

### Scale
```css
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
--space-20: 5rem      /* 80px */
```

### Usage
- **Component padding**: 12px, 16px, 24px
- **Section spacing**: 32px, 48px, 64px
- **Page margins**: 24px, 32px

## Border Radius

```css
--radius-sm: 0.25rem     /* 4px - small elements */
--radius-md: 0.5rem      /* 8px - cards, buttons */
--radius-lg: 0.75rem     /* 12px - inputs */
--radius-xl: 1rem        /* 16px - large inputs */
--radius-2xl: 1.5rem     /* 24px - cards, containers */
--radius-full: 9999px    /* full rounded */
```

## Component Guidelines

### Buttons
- **Variants**: Primary (black), Secondary (bordered), Ghost (transparent)
- **Sizes**: Small (8px/16px), Medium (12px/24px), Large (16px/32px)
- **Border Radius**: 12px (md), 16px (lg), 24px (xl)
- **No shadows**: Clean, flat design

### Form Elements
- **Border**: 1px solid gray-200
- **Focus**: 1px solid black
- **Padding**: 12px horizontal, 12px vertical
- **Border Radius**: 12px
- **Background**: White

### Layout
- **Container**: Max-width 1200px, centered
- **Grid**: CSS Grid preferred over Flexbox for complex layouts
- **Breakpoints**: Mobile-first, 640px, 768px, 1024px

### Separators
```css
.divider {
  height: 1px;
  background-color: var(--color-border);
  border: none;
  margin: var(--space-8) 0;
}
```

## Interaction Design

### Transitions
```css
--transition-fast: 150ms ease
--transition-normal: 250ms ease
--transition-slow: 350ms ease
```

### Hover States
- **Buttons**: Subtle background color change
- **Links**: No underlines, color/background change only
- **Elements**: Border color change, background lightening

### Focus States
- **Outline**: 2px solid black, 2px offset
- **No box-shadow**: Keep it minimal

## Layout Patterns

### Inset Views (Not Cards)
```css
.inset-view {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  background: var(--color-white);
}
```

### Content Sections
- Use `<hr class="divider">` for section breaks
- Prefer typography hierarchy over background colors
- Generous whitespace between sections

### Forms
- Vertical spacing between fields
- Clear labels above inputs
- Helper text below inputs
- Error states with red text, no background colors

## Implementation Notes

### CSS Architecture
- **CSS Variables**: Use custom properties for all design tokens
- **CSS Modules**: Scoped component styles
- **No Frameworks**: Pure CSS with design system variables
- **Utility Classes**: Minimal, semantic utilities only

### Typography Implementation
- Use relative units (rem) for scalability
- Maintain vertical rhythm
- Optimize for reading: proper line heights and spacing

### Responsive Design
- Mobile-first approach
- Consistent spacing across breakpoints
- Typography scales appropriately
- No complex responsive grids

## Inspiration Sources

- **The New York Times**: Typography hierarchy and spacing
- **Medium**: Clean reading experience and minimal design
- **Linear**: Modern minimalism and button design
- **Figma**: Clean interfaces and systematic design

## Anti-Patterns

### Avoid These
- ❌ Bright colors or gradients
- ❌ Drop shadows and elevation
- ❌ Heavy use of icons
- ❌ Complex animations
- ❌ Textured backgrounds
- ❌ Multiple font families
- ❌ Colored text for emphasis
- ❌ Heavy borders or outlines

### Instead Use
- ✅ Monochrome palette
- ✅ Flat, clean design
- ✅ Typography for hierarchy
- ✅ Subtle transitions
- ✅ White/light backgrounds
- ✅ Single serif font family
- ✅ Size/weight for emphasis
- ✅ Subtle 1px borders

## Future Considerations

### Component Expansion
- Dropdown menus
- Modal dialogs
- Navigation components
- Data tables
- Image galleries
- Form validation patterns

### Accessibility
- Ensure sufficient color contrast
- Keyboard navigation patterns
- Screen reader compatibility
- Focus management

### Performance
- Minimal CSS bundle size
- Efficient variable usage
- Optimized font loading
- Clean, semantic HTML