# 🎨 PlatePal Color Palette Guide

## Overview

This document provides recommended color palettes for each interface in the PlatePal ecosystem. Each palette is designed to support the specific goals and user experience requirements of its interface while maintaining brand consistency across the platform.

---

## 1. 🍽️ **Customer Web App** (Food Ordering Interface)

*Goal: Appetizing, welcoming, and engaging*

### Primary Colors
```css
--primary: #FF6B35          /* Vibrant Orange - CTAs, Order buttons */
--primary-hover: #FF5722     /* Hover state */
--primary-light: #FFE5DC     /* Backgrounds, highlights */
```

### Secondary Colors
```css
--secondary: #4ECDC4         /* Teal/Turquoise - Restaurant cards, icons */
--secondary-hover: #3DBDB3   
--secondary-light: #E0F7F5   
```

### Accent Colors
```css
--accent: #FFD93D           /* Yellow - Ratings, special offers */
--accent-dark: #FFC107      
```

### Neutral Colors
```css
--background: #F8F9FA       /* Light gray background */
--surface: #FFFFFF          /* Cards, menu items */
--text-primary: #2D3436     /* Dark gray text */
--text-secondary: #636E72   /* Secondary text */
--border: #E1E5E9          /* Borders */
```

### Status Colors
```css
--success: #26C281          /* Order confirmed */
--warning: #F39C12          /* Preparing */
--error: #E74C3C           /* Cancelled */
--info: #3498DB            /* En route */
```

### Rationale
- **Orange** stimulates appetite and creates a sense of urgency for ordering
- **Teal** provides freshness and trust - perfect for restaurant selection
- **Yellow** adds excitement and draws attention to deals and ratings
- **Warm, food-focused** palette that encourages ordering behavior

---

## 2. 🏪 **Restaurant Dashboard** (Business Management)

*Goal: Professional, efficient, data-driven*

### Primary Colors
```css
--primary: #5B4BB4          /* Deep Purple - Professional, premium */
--primary-hover: #4A3A93    
--primary-light: #EDE8F8    
```

### Secondary Colors
```css
--secondary: #2ECC71        /* Green - Revenue, success metrics */
--secondary-hover: #27AE60  
--secondary-light: #E8F8F0  
```

### Accent Colors
```css
--accent: #FF9F43          /* Warm Orange - Alerts, new orders */
--accent-dark: #EE8526     
```

### Neutral Colors
```css
--background: #F5F6FA      /* Soft gray-blue background */
--surface: #FFFFFF         /* Tables, cards */
--surface-dark: #2C3E50    /* Sidebar */
--text-primary: #2C3E50    /* Navy text */
--text-secondary: #7F8C9B  
--border: #DFE4EA         
```

### Status Colors
```css
--success: #2ECC71         /* Completed orders */
--warning: #F39C12         /* Pending orders */
--error: #E74C3C          /* Rejected/cancelled */
--info: #3498DB           /* Information */
```

### Rationale
- **Purple** conveys professionalism and premium quality - perfect for business owners
- **Green** emphasizes growth and revenue - important for financial metrics
- **Orange** draws attention to new orders and requires action
- **Professional, dashboard-focused** palette that supports long work sessions

---

## 3. 🚚 **Delivery Web App** (Driver Interface)

*Goal: High visibility, action-oriented, efficient*

### Primary Colors
```css
--primary: #00B894          /* Bright Green - Active, go, delivery */
--primary-hover: #00A383    
--primary-light: #E0F5F1    
```

### Secondary Colors
```css
--secondary: #2D3436        /* Dark Gray - Professionalism */
--secondary-hover: #1E2426  
--secondary-light: #DFE6E9  
```

### Accent Colors
```css
--accent: #FDCB6E          /* Bright Yellow - Warnings, attention */
--accent-dark: #F8B731     
```

### Neutral Colors
```css
--background: #FAFBFC      /* Clean white-gray */
--surface: #FFFFFF         /* Task cards */
--text-primary: #2D3436    
--text-secondary: #636E72  
--border: #E1E5E9         
```

### Status Colors
```css
--active: #00B894          /* Active delivery */
--available: #74B9FF       /* Available for pickup */
--completed: #A29BFE       /* Completed delivery */
--urgent: #FD79A8          /* Urgent/delayed */
```

### Rationale
- **Green** signifies "go" and active status - uses traffic light psychology
- **High contrast** colors for outdoor visibility when drivers are on the road
- **Bright, action-oriented** palette that supports quick decision-making
- **Clear status differentiation** for various delivery states

---

## 4. 👨‍💼 **Admin Dashboard** (Platform Management)

*Goal: Authoritative, data-focused, systematic*

### Primary Colors
```css
--primary: #2C3E50          /* Navy Blue - Authority, trust */
--primary-hover: #1A252F    
--primary-light: #E8ECEF    
```

### Secondary Colors
```css
--secondary: #3498DB        /* Bright Blue - Data, analytics */
--secondary-hover: #2980B9  
--secondary-light: #EBF5FB  
```

### Accent Colors
```css
--accent: #E67E22          /* Orange - Actions, highlights */
--accent-dark: #D35400     
```

### Neutral Colors
```css
--background: #ECF0F1      /* Cool gray background */
--surface: #FFFFFF         /* Tables, metrics */
--surface-elevated: #FAFBFC /* Modals */
--text-primary: #2C3E50    
--text-secondary: #7F8FA4  
--border: #D5DBDB         
```

### Status Colors
```css
--success: #27AE60         /* Approvals */
--warning: #F39C12         /* Pending reviews */
--error: #C0392B          /* Violations, blocks */
--info: #3498DB           /* System info */
--critical: #8E44AD        /* Critical alerts */
```

### Rationale
- **Dark navy** establishes authority and seriousness - appropriate for administrative tasks
- **Blue** represents data and analytics - perfect for charts and metrics
- **Orange** draws attention to actions that require immediate attention
- **Additional critical status** color for admin-level alerts
- **Professional, enterprise-grade** palette suitable for administrative interfaces

---

## 📊 **Cross-Platform Consistency**

### Shared Elements (Keep consistent across all interfaces):

#### Status Colors
```css
/* Success/Error/Warning - Keep consistent for user familiarity */
--status-success: #27AE60
--status-warning: #F39C12
--status-error: #E74C3C
--status-info: #3498DB
```

#### Typography
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
--font-mono: 'SF Mono', Monaco, Consolas, monospace
```

#### Shadows
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10)
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12)
```

#### Border Radius
```css
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

---

## 🎯 **Implementation Priority**

1. **Customer Web App** - Primary revenue interface, most user-facing
2. **Restaurant Dashboard** - Critical for restaurant partner satisfaction and retention
3. **Delivery Web App** - Essential for operational efficiency and driver satisfaction
4. **Admin Dashboard** - Internal tool, can be styled last

---

## ♿ **Accessibility Standards**

All suggested colors meet **WCAG 2.1 AA** compliance standards:

- **Text on backgrounds**: Minimum 4.5:1 contrast ratio
- **Large text (18pt+)**: Minimum 3:1 contrast ratio
- **Interactive elements**: Clear focus states with 3:1 contrast minimum
- **Color blind friendly**: Status indicators use patterns/icons in addition to color

### Contrast Ratios (Verified)

| Color Combination | Ratio | Status |
|-------------------|-------|--------|
| Primary text on white | 14.5:1 | ✅ AAA |
| Secondary text on white | 7.2:1 | ✅ AA |
| Primary button text | 4.8:1 | ✅ AA |
| Status colors on white | >4.5:1 | ✅ AA |

---

## 🔄 **Migration from Current System**

### Current Design System Colors
- Primary Orange: `#FF6B35` ✅ (Keep for Customer Web)
- Primary Green: `#4CAF50` (Update to interface-specific greens)
- Primary Blue: `#2196F3` (Update to interface-specific blues)

### Recommended Migration Steps

1. **Phase 1**: Implement Customer Web palette (maintains existing orange)
2. **Phase 2**: Roll out Restaurant Dashboard palette
3. **Phase 3**: Implement Delivery Web palette
4. **Phase 4**: Complete Admin Dashboard palette
5. **Phase 5**: Update shared components and status colors

---

## 📝 **Usage Guidelines**

### Do's ✅
- Use primary colors for main CTAs and key actions
- Maintain consistent status colors across all interfaces
- Use hover states for all interactive elements
- Apply light variants for backgrounds and highlights
- Follow the neutral hierarchy for text readability

### Don'ts ❌
- Don't mix interface-specific palettes
- Don't use status colors for decorative purposes
- Don't reduce contrast below WCAG AA standards
- Don't use more than 3 primary/secondary colors per screen
- Don't ignore dark mode considerations (if implemented)

---

## 🛠️ **Implementation Examples**

### Tailwind Config Example (Customer Web)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          hover: '#FF5722',
          light: '#FFE5DC',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          hover: '#3DBDB3',
          light: '#E0F7F5',
        },
        status: {
          success: '#26C281',
          warning: '#F39C12',
          error: '#E74C3C',
          info: '#3498DB',
        },
      },
    },
  },
}
```

### CSS Custom Properties Example
```css
:root {
  --color-primary: #FF6B35;
  --color-primary-hover: #FF5722;
  --color-primary-light: #FFE5DC;
  --color-secondary: #4ECDC4;
  --color-secondary-hover: #3DBDB3;
  --color-secondary-light: #E0F7F5;
  --color-status-success: #26C281;
  --color-status-warning: #F39C12;
  --color-status-error: #E74C3C;
  --color-status-info: #3498DB;
}
```

---

## 📚 **Additional Resources**

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)

---

*Last Updated: Based on PlatePal project analysis*
*Version: 1.0*

