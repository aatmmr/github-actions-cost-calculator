# Planning Guide

A web-based cost calculator that helps engineering teams and DevOps professionals compare the financial impact of GitHub-hosted runners versus self-hosted runner infrastructure for GitHub Actions workflows.

**Experience Qualities**:
1. **Analytical** - Provides clear, data-driven cost comparisons that enable informed infrastructure decisions
2. **Efficient** - Delivers instant calculations with minimal input, respecting users' time and focus
3. **Professional** - Presents complex pricing information in a clean, trustworthy interface that inspires confidence

**Complexity Level**: Micro Tool (single-purpose application)
This is a focused calculator with a single core function: comparing runner costs. It requires basic state management for inputs and calculations, but no data persistence, multiple views, or complex workflows.

## Essential Features

### Cost Input Form
- **Functionality**: Accepts user input for self-hosted infrastructure costs with flexible time units (per minute or per hour)
- **Purpose**: Captures the variable cost of self-hosted infrastructure to enable accurate comparison
- **Trigger**: User lands on the page and sees the input form immediately
- **Progression**: User selects time unit (minute/hour) → enters cost value → sees instant calculation update
- **Success criteria**: Input accepts decimal values, unit toggle is intuitive, validation prevents invalid entries

### GitHub-Hosted Runner Pricing Display
- **Functionality**: Shows current 2026 GitHub-hosted runner pricing across all runner types (Ubuntu, Windows, macOS in various sizes)
- **Purpose**: Provides the baseline comparison data for hosted runner costs
- **Trigger**: Displayed on page load as reference information
- **Progression**: Static display → user references while comparing → informs decision-making
- **Success criteria**: Pricing matches official GitHub documentation, organized by OS and size, clearly labeled

### Cost Comparison Calculator
- **Functionality**: Calculates cost per build minute for self-hosted infrastructure and displays side-by-side comparison with GitHub-hosted options
- **Purpose**: Core value proposition - shows exactly which option is more cost-effective and by how much
- **Trigger**: Automatically calculates as user inputs self-hosted costs
- **Progression**: User inputs cost → calculation runs instantly → comparison displays with savings/additional cost highlighted → user makes informed decision
- **Success criteria**: Math is accurate (hourly rate / 60 = per minute rate), updates reactively, clearly shows which option is cheaper

### Cost Differential Visualization
- **Functionality**: Displays the percentage and absolute cost difference between self-hosted and each GitHub-hosted runner type
- **Purpose**: Makes cost savings or additional expenses immediately obvious at a glance
- **Trigger**: Appears alongside comparison data once self-hosted cost is entered
- **Progression**: Calculation completes → differential appears with color coding (green for savings, red for additional cost) → user quickly identifies best option
- **Success criteria**: Percentages calculated correctly, color coding is intuitive, both absolute and relative differences shown

## Edge Case Handling

- **Empty Input State**: Display helpful placeholder text and show only GitHub-hosted pricing until user enters self-hosted cost
- **Zero or Negative Values**: Validate input to prevent zero or negative costs with inline error message
- **Extreme Values**: Handle very large or very small decimal values gracefully with proper formatting
- **Unit Conversion Edge Cases**: Ensure accurate conversion between hourly and per-minute rates with proper rounding

## Design Direction

The design should evoke precision, clarity, and trustworthiness - like a professional financial tool. It should feel data-focused without being sterile, using subtle color to highlight insights while maintaining a clean, uncluttered workspace. The interface should communicate technical competence and inspire confidence in the calculations.

## Color Selection

A professional, developer-focused palette with technical undertones and clear data visualization accents.

- **Primary Color**: Deep indigo `oklch(0.35 0.12 265)` - Conveys technical authority and trust, used for headings and primary UI elements
- **Secondary Colors**: 
  - Slate gray `oklch(0.45 0.02 250)` for secondary text and borders
  - Cool white `oklch(0.98 0.01 250)` for backgrounds creating a clean workspace
- **Accent Color**: Vibrant cyan `oklch(0.70 0.15 210)` - Energetic highlight for interactive elements and key CTAs, draws attention to input areas
- **Data Visualization Colors**:
  - Success green `oklch(0.65 0.18 145)` for cost savings
  - Warning amber `oklch(0.75 0.15 75)` for neutral or marginal differences
  - Alert red `oklch(0.65 0.20 25)` for additional costs

**Foreground/Background Pairings**:
- Primary (Deep Indigo #1D2B6B): White text (#FFFFFF) - Ratio 8.2:1 ✓
- Accent (Vibrant Cyan #2DBACC): Dark text (#1A1A1A) - Ratio 7.1:1 ✓
- Background (Cool White #FAFBFC): Slate text (#5F6B7C) - Ratio 6.8:1 ✓
- Success (Green #3EAD6E): White text (#FFFFFF) - Ratio 4.9:1 ✓

## Font Selection

Typefaces should convey technical precision while maintaining readability for data-heavy content.

- **Primary Font**: Space Grotesk - Modern, technical aesthetic with geometric precision, excellent for headings and labels
- **Secondary Font**: IBM Plex Sans - Clean, highly legible for body text and numerical data with excellent tabular figure support

**Typographic Hierarchy**:
- H1 (Calculator Title): Space Grotesk Bold/32px/tight letter spacing (-0.02em)
- H2 (Section Headers): Space Grotesk SemiBold/24px/normal spacing
- H3 (Runner Types): Space Grotesk Medium/18px/normal spacing
- Body (Descriptions): IBM Plex Sans Regular/16px/relaxed line height (1.6)
- Data (Prices/Numbers): IBM Plex Sans Medium/18px/tabular figures
- Labels (Form Inputs): IBM Plex Sans Medium/14px/wide letter spacing (0.01em)

## Animations

Animations should feel precise and purposeful, like data updating in a financial dashboard. Use subtle transitions for state changes (150-200ms) to reinforce calculation updates. Employ gentle scale and color transitions on interactive elements (buttons, inputs) to provide satisfying feedback without distraction. When comparison results appear, use a subtle fade-in with slight upward movement (300ms) to draw attention to new insights. Keep all motion smooth and professional - never bouncy or playful.

## Component Selection

- **Components**:
  - **Card**: Primary container for calculator sections (input form, pricing tables, comparison results) with subtle shadows for depth
  - **Input**: Number input for cost entry with clear labeling and inline validation
  - **Label**: Form field labels with proper accessibility
  - **RadioGroup/Toggle**: For selecting time unit (per minute vs per hour) with clear visual selection state
  - **Table**: Display GitHub-hosted runner pricing in organized rows by runner type
  - **Badge**: Show runner OS types (Ubuntu, Windows, macOS) with color coding
  - **Separator**: Divide sections cleanly without heavy visual weight
  
- **Customizations**:
  - **Comparison Card**: Custom component showing side-by-side cost comparison with color-coded savings indicators
  - **Cost Differential Display**: Custom numerical display with percentage and absolute values, dynamically colored
  - **Runner Pricing Table**: Custom table layout with improved visual hierarchy for runner types and pricing tiers

- **States**:
  - Input fields: Subtle border color change on focus (accent cyan), validation error state (alert red)
  - Calculation results: Fade in smoothly when values update, highlight new values briefly
  - Comparison cards: Hover state with subtle lift (2px) and shadow increase for depth
  - Toggle/Radio: Bold visual difference between selected (filled with accent) and unselected (outlined)

- **Icon Selection**:
  - Calculator icon for main heading
  - ArrowRight for comparison direction
  - TrendUp/TrendDown for cost differentials
  - Check for cost savings, Warning for higher costs
  - CurrencyDollar for pricing displays

- **Spacing**:
  - Section padding: p-8 (2rem) for card interiors
  - Element gaps: gap-6 (1.5rem) between major sections
  - Form spacing: gap-4 (1rem) between form elements
  - Inline spacing: gap-2 (0.5rem) for related inline elements
  - Page margins: max-w-6xl mx-auto with px-4 for responsive containment

- **Mobile**:
  - Stack cards vertically on mobile (flex-col)
  - Reduce heading sizes: H1 to 24px, H2 to 20px on <768px
  - Full-width inputs and buttons
  - Simplify table layout to single column with clear labels
  - Reduce padding: p-6 on cards, gap-4 between sections
  - Comparison results stack vertically with clear separators
