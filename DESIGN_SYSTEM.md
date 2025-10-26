# PlatePal Design System

## 🎨 Brand Identity

### Primary Colors
- **Primary Orange**: `#FF6B35` - Main brand color for CTAs and highlights
- **Primary Green**: `#4CAF50` - Success states and delivery-related elements
- **Primary Blue**: `#2196F3` - Information and navigation elements

### Secondary Colors
- **Dark Gray**: `#333333` - Primary text color
- **Medium Gray**: `#666666` - Secondary text color
- **Light Gray**: `#999999` - Tertiary text color
- **Background Gray**: `#F8F9FA` - Page backgrounds
- **White**: `#FFFFFF` - Card backgrounds and contrast

### Status Colors
- **Success**: `#4CAF50` - Completed orders, success messages
- **Warning**: `#FF9800` - Pending orders, warnings
- **Error**: `#F44336` - Error states, cancellations
- **Info**: `#2196F3` - Information messages, links

## 📝 Typography

### Font Families
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Monospace**: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace

### Font Sizes
- **H1**: 32px / 2rem - Page titles
- **H2**: 24px / 1.5rem - Section titles
- **H3**: 20px / 1.25rem - Subsection titles
- **H4**: 18px / 1.125rem - Card titles
- **Body Large**: 16px / 1rem - Primary body text
- **Body**: 14px / 0.875rem - Secondary text
- **Caption**: 12px / 0.75rem - Small labels and captions

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## 🧩 Components

### Buttons

#### Primary Button
```css
background: #FF6B35;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
font-size: 16px;
```

#### Secondary Button
```css
background: transparent;
color: #FF6B35;
border: 2px solid #FF6B35;
border-radius: 8px;
padding: 10px 22px;
font-weight: 600;
font-size: 16px;
```

#### Success Button
```css
background: #4CAF50;
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
font-size: 16px;
```

### Cards
```css
background: #FFFFFF;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
padding: 24px;
border: 1px solid #E1E5E9;
```

### Input Fields
```css
background: #FFFFFF;
border: 1px solid #E1E5E9;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
color: #333333;
```

### Status Badges
```css
padding: 4px 12px;
border-radius: 16px;
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
```

## 📱 Mobile Design Guidelines

### Spacing
- **XS**: 4px - Small gaps
- **S**: 8px - Element spacing
- **M**: 16px - Section spacing
- **L**: 24px - Large sections
- **XL**: 32px - Page margins

### Touch Targets
- Minimum touch target size: 44px x 44px
- Recommended touch target size: 48px x 48px
- Spacing between touch targets: 8px minimum

### Screen Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🎯 User Experience Principles

### Accessibility
- WCAG 2.1 AA compliance
- High contrast ratios (4.5:1 minimum)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators

### Performance
- Fast loading times (< 3 seconds)
- Smooth animations (60fps)
- Optimized images and assets
- Lazy loading for content

### Usability
- Clear navigation patterns
- Consistent interaction patterns
- Intuitive iconography
- Helpful error messages
- Loading states and feedback

## 🚀 Implementation Guidelines

### CSS Custom Properties
```css
:root {
  --color-primary: #FF6B35;
  --color-primary-green: #4CAF50;
  --color-primary-blue: #2196F3;
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-background: #F8F9FA;
  --color-white: #FFFFFF;
  --color-border: #E1E5E9;
  
  --font-family-primary: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;
  
  --spacing-xs: 4px;
  --spacing-s: 8px;
  --spacing-m: 16px;
  --spacing-l: 24px;
  --spacing-xl: 32px;
  
  --border-radius-s: 4px;
  --border-radius-m: 8px;
  --border-radius-l: 12px;
  --border-radius-xl: 16px;
  
  --shadow-s: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-m: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-l: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

### Component Library Structure
```
components/
├── atoms/
│   ├── Button/
│   ├── Input/
│   ├── Badge/
│   └── Icon/
├── molecules/
│   ├── SearchBar/
│   ├── Card/
│   ├── Navigation/
│   └── FormField/
└── organisms/
    ├── Header/
    ├── Sidebar/
    ├── Table/
    └── Modal/
```

## 🎨 Visual Examples

### Color Palette
- Primary Orange: Used for main CTAs, brand elements
- Primary Green: Success states, delivery confirmations
- Primary Blue: Information, navigation, links
- Grays: Text hierarchy, backgrounds, borders

### Iconography
- Use consistent icon style (outlined or filled)
- Maintain consistent stroke width
- Use semantic icons (food, delivery, user, etc.)
- Ensure icons are scalable and clear

### Imagery
- High-quality food photography
- Consistent aspect ratios
- Optimized file sizes
- Fallback images for loading states

## 📋 Checklist for Implementation

### Design System
- [ ] Color palette implemented
- [ ] Typography system in place
- [ ] Component library created
- [ ] Spacing system defined
- [ ] Icon library established

### Accessibility
- [ ] Color contrast ratios checked
- [ ] Keyboard navigation implemented
- [ ] Screen reader compatibility
- [ ] Focus indicators added
- [ ] Alt text for images

### Performance
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript bundled
- [ ] Loading states implemented
- [ ] Error boundaries added

### Testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] User acceptance testing

---

This design system ensures consistency across all PlatePal applications while maintaining a modern, user-friendly interface that reflects the brand's values of quality, reliability, and convenience.
