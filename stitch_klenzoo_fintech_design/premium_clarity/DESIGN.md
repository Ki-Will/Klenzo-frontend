# The Design System: Premium Clarity

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Atelier"**
This design system moves beyond the cold, utilitarian nature of traditional fintech. It is built on the philosophy of "The Digital Atelier"—a space that feels curated, bespoke, and meticulously organized. We achieve "Premium Clarity" not through more lines, but through more light. 

By leveraging intentional asymmetry, expansive negative space, and a sophisticated "white-on-white" layering technique, we create a UI that feels like a high-end editorial spread. We break the "template" look by treating the screen as a physical desk where information is layered, not just placed.

---

## 2. Colors & Tonal Depth
The palette is anchored in high-contrast neutrals and a singular, authoritative Indigo accent. 

### The Palette
- **Primary Indigo (`#4F46E5`):** Our signature of intent. Use it sparingly for primary actions and critical highlights.
- **Surface System:** 
  - `surface-container-lowest` (#FFFFFF): The base canvas.
  - `surface` (#F8F9FA): The secondary "paper" layer.
  - `surface-container-low` (#F3F4F5): For subtle depth shifts.
- **Functional:** `Success` (#10B981) and `Error` (#BA1A1A) are used for status, but should be integrated into small, sophisticated markers (pills or dots) rather than large blocks of color.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning or card definition. Boundaries must be defined solely through background color shifts or tonal transitions. To separate a card from the background, place a `surface-container-lowest` card onto a `surface` section. The contrast is the border.

### The "Glass & Gradient" Rule
To elevate the experience from "standard flat" to "premium," use Glassmorphism for floating elements (e.g., sticky headers or bottom navigation). 
- **Effect:** Apply a `surface-container-lowest` color with 80% opacity and a 20px backdrop blur.
- **Signature Gradient:** For primary CTAs, use a subtle linear gradient from `primary` (#3525CD) to `primary-container` (#4F46E5) at a 135-degree angle. This adds a "soul" and physical weight to the button.

---

## 3. Typography: Editorial Authority
We use **Manrope** exclusively. It is a geometric sans-serif that balances modern tech precision with humanist warmth.

- **Display (Display-LG to Display-SM):** Used for large balances or hero statements. Set with tight letter-spacing (-0.02em) to feel cohesive and architectural.
- **Headlines (Headline-LG to Headline-SM):** Use for page titles. These should have generous leading to allow the "Premium Clarity" to breathe.
- **Body (Body-LG to Body-SM):** Information density is managed through `Secondary Text` (#6B7280). Use `Body-MD` for most interactions to maintain an airy feel.
- **Labels (Label-MD to Label-SM):** Always uppercase with +0.05em letter-spacing when used for category headers, creating a sophisticated "tag" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
We reject the heavy drop-shadows of the past. Hierarchy is achieved through the **Layering Principle**.

- **Surface Stacking:** 
  1. Base Layer: `surface` (#F8F9FA).
  2. Content Layer: `surface-container-lowest` (#FFFFFF).
  3. Action Layer: Floating elements using the Glassmorphism rule.
- **Ambient Shadows:** If an element must float (like a Modal), use a "Whisper Shadow": `Y: 20px, Blur: 40px, Color: On-Surface (#191C1D) at 4% opacity`. It should feel like a soft glow of light, not a shadow.
- **The "Ghost Border":** If accessibility requires a stroke (e.g., Input Fields), use `outline-variant` (#C7C4D8) at 20% opacity. This provides a "hint" of a container without breaking the seamless white aesthetic.

---

## 5. Components: The Primitive Set

### Buttons
- **Primary:** Gradient-filled (Primary to Primary-Container), `rounded-md` (0.375rem). No shadow.
- **Secondary:** `surface-container-high` background with `primary` text. No border.
- **Tertiary:** Pure text in `primary` with 0.45rem horizontal padding for a "ghost" touch target.

### Cards & Lists
- **The Rule of Zero Dividers:** Forbid the use of 1px divider lines in lists. Use `0.75rem` to `1rem` of vertical white space to separate list items. 
- **Interactive Cards:** Use a subtle hover state where the background shifts from `surface-container-lowest` to `surface-container-low`.

### Input Fields
- **Minimalist Frames:** Inputs should have no background color (transparent) and only a "Ghost Border" on the bottom, or a very light `surface-container-low` fill with no border.
- **Focus State:** Transition the bottom border to `primary` (#4F46E5) with a 2px height.

### Specialized Fintech Components
- **The Balance Display:** Use `display-md` for the integer and `title-md` for decimals, creating a visual hierarchy within the number itself.
- **Transaction Chips:** Use a `rounded-full` (9999px) shape with a `surface-container-highest` background and `on-surface-variant` text for a pill-like, tactile feel.

---

## 6. Do’s and Don’ts

### Do
- **DO** use asymmetrical margins (e.g., a wider left margin than right) for editorial layouts in tablet views.
- **DO** use "True White" (#FFFFFF) for the most important interactive elements to make them pop against the #F8F9FA background.
- **DO** embrace "Extreme Padding." If you think there is enough space, add 8px more.

### Don't
- **DON'T** use pure black (#000000). Use `On-Surface` (#191C1D) for high-contrast text to keep it sophisticated.
- **DON'T** use 1px dividers to separate content. Use tonal shifts and white space.
- **DON'T** use sharp corners. Stick to the `md` (0.375rem) and `xl` (0.75rem) radius scale to keep the "Soft Minimalist" feel.
- **DON'T** use standard Material shadows. Always use the "Whisper Shadow" (low opacity, high blur).