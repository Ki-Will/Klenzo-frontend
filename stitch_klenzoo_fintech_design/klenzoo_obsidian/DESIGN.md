# Design System Specification: The Fluid Financial Core

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Intelligent Void."** 

In an industry often cluttered with data density and rigid grids, this system seeks to create a premium, editorial experience by treating the interface as a living, breathing space. We are moving away from the "app-in-a-box" aesthetic toward a layout that feels curated and expansive. By leveraging intentional asymmetry, oversized typography, and deep tonal layering, we create a sense of "Smart Luxury"—where the interface feels less like a tool and more like a private digital concierge.

### Editorial Logic
*   **Asymmetric Breathing Room:** Don't center everything. Use generous, uneven whitespace to guide the eye.
*   **Contextual Depth:** Elements don't just "sit" on the screen; they emerge from the shadows.
*   **Kinetic Clarity:** Every transition should feel like fluid motion, moving between the deep background and the luminous interactive layers.

---

## 2. Colors & Surface Philosophy
The palette is rooted in an ultra-dark foundation, using light not as a decoration, but as a functional beacon.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Traditional lines create visual noise. Instead, boundaries must be defined solely through background color shifts (e.g., a `surface-container-low` section sitting on a `surface` background) or subtle tonal transitions.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of obsidian glass.
*   **Foundation:** `surface` (#131313) is the infinite canvas.
*   **Nesting Logic:** Place a `surface-container-lowest` (#0E0E0E) card inside a `surface-container-low` (#1C1B1B) section to create an "etched" or recessed feel. Conversely, use `surface-container-high` (#2A2A2A) to lift critical information toward the user.

### The "Glass & Gradient" Rule
To escape the "flat" look, floating elements (Modals, Hover states, Floating Action Buttons) should utilize **Glassmorphism**.
*   **Value:** Use semi-transparent variants of `surface-container` with a `backdrop-blur` of 20px–40px.
*   **Signature Textures:** For high-impact CTAs, apply a subtle linear gradient: `primary_container` (#4F46E5) to `primary` (#C3C0FF) at a 135° angle. This provides a "luminous" quality that static hex codes cannot match.

---

## 3. Typography
We use a dual-typeface strategy to balance high-fashion editorial aesthetics with functional precision.

*   **Display & Headlines (Manrope):** Chosen for its geometric soul and modern proportions. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero balances to command authority.
*   **Body & Labels (Inter):** The workhorse. Inter provides maximum legibility for transaction histories and fine print.
*   **Hierarchy Note:** Use extreme contrast. Pair a `display-md` headline with a `label-sm` subtitle to create a sophisticated, high-end rhythmic tension.

---

## 4. Elevation & Depth
Depth is a functional variable, not an afterthought. We utilize **Tonal Layering** to convey hierarchy.

### The Layering Principle
Avoid shadows for static elements. Depth is achieved by "stacking" the surface-container tiers.
*   **Deep Recess:** Use `surface-container-lowest` for input fields to make them feel carved into the UI.
*   **Elevated Focus:** Use `surface-container-highest` for active state cards.

### Ambient Shadows
When an element must "float" (e.g., a dropdown or a floating card), use **Ambient Shadows**:
*   **Spec:** `Y: 20px, Blur: 40px, Color: rgba(0, 0, 0, 0.4)`. 
*   **Shadow Tint:** For a premium feel, tint the shadow with the `primary` color at 4% opacity to simulate natural light refraction.

### The "Ghost Border" Fallback
If accessibility requires a container boundary, use a **Ghost Border**:
*   **Spec:** `outline-variant` (#464555) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** High-luminance. Background: Gradient (`primary_container` to `primary`). Shape: `full` (9999px).
*   **Secondary:** Glass-based. Background: `surface-container-high` at 60% opacity with backdrop-blur. 
*   **Tertiary:** No background. Bold `primary` text.

### Inputs & Fields
*   **Styling:** Forbid traditional boxes. Use `surface-container-low` with a `md` (1.5rem) border-radius.
*   **Interaction:** On focus, the container transitions to `surface-container-high` with a 1px "Ghost Border" in `primary`.

### Cards & Lists
*   **The No-Divider Rule:** Explicitly forbid 1px dividers between list items. Use **Vertical White Space** (minimum 16px) or alternating tonal shifts between `surface-container-low` and `surface-container-lowest`.
*   **Radius:** Primary cards use `lg` (2rem); secondary nested elements use `sm` (0.5rem).

### Fintech-Specific Components
*   **The "Value Glow" Chart:** Use the `primary` color for line charts, but apply a drop-shadow to the line itself to create a "neon wire" effect.
*   **Luminous Chips:** Status chips (Success/Danger) should use a desaturated background with a high-vibrancy dot or text color to ensure readability against the dark UI.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts to highlight primary actions (e.g., a large balance off-set to the left).
*   **Do** leverage the `xl` (3rem) border radius for top-level containers to emphasize the "soft-tech" feel.
*   **Do** use `surface-bright` (#3A3939) sparingly for subtle hover states on dark buttons.

### Don’t
*   **Don’t** use pure white (#FFFFFF) for body text. Use `on_surface_variant` (#C7C4D8) to reduce eye strain and maintain the "Intelligent Void" mood.
*   **Don’t** use standard Material Design "Drop Shadows." They feel dated and "heavy."
*   **Don’t** use sharp corners. Every interaction point must feel smoothed and approachable (min-radius: `sm`).