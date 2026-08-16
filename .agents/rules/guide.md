---
trigger: always_on
---

The application must not look obviously AI-generated. Avoid common patterns frequently produced by AI coding assistants.

Never Use
Emojis in UI, buttons, headings, notifications, or empty states
Color gradients
Gradient text
Gradient buttons
Excessive glassmorphism
Excessive rounded cards
Huge rounded containers
Excessive use of shadows
Neon/glowing effects
Random colorful backgrounds
Decorative blobs
Floating gradient circles
Excessive use of purple/blue/pink accent colors
Generic "modern AI" landing-page aesthetics
Unnecessary animated backgrounds
Excessive blur
Fake statistics or decorative metrics
Generic motivational text
Unnecessary hero sections
Excessive use of cards when a simple layout would work
Excessive pill-shaped UI elements
Emoji-based status indicators
Unnecessary icons beside every piece of text
Avoid AI-Generated Copy

Do not use generic marketing language such as:

"Supercharge your productivity"
"Take your productivity to the next level"
"Your all-in-one solution"
"Seamlessly manage..."
"Unlock your potential"
"Powerful yet simple"
"Designed for modern teams"
"Work smarter, not harder" Use concise, functional language instead.
Bad

Supercharge your productivity with our powerful scheduling experience.

Good

Schedule

Bad

Stay on top of everything with your personalized productivity dashboard.

Good

Today's Schedule

Visual Authenticity

Design the interface as if it was created by an experienced product designer, not generated from a generic UI template. Use visual decisions that are appropriate to the actual application. For example: A scheduling application should prioritize:

Time
Dates
Schedule visibility
Current activity
Upcoming activity
Reminders
Quick editing Do not add decorative elements that compete with these functions. --
Color Discipline

Use a restrained color system. Prefer:

Neutral backgrounds
Neutral surfaces
One primary accent
Semantic colors for success, warning, and errors Use color because it communicates information, not simply because it makes the interface more colorful. Never use gradients. If an accent color is needed, use a solid color.
Icon Discipline

Use Lucide Icons. Do not replace icons with emojis such as:

text
Calendar emoji
Clock emoji
Bell emoji
Checkmark emoji
Warning emoji
Rocket emoji
Fire emoji
Sparkles emoji
Use appropriate Lucide icons instead. Icons should have a functional purpose. Do not add an icon to every button or piece of text simply to make the interface look more sophisticated.
Animation Discipline

Animations should communicate state changes or improve usability. Good examples:

Modal opening
Dropdown opening
Button interaction
Schedule being moved
Toast appearing
Sidebar opening Avoid:
Constant floating animations
Pulsing decorations
Animated gradients
Background animations
Excessive hover transformations
Large scale animations Animations should be subtle and fast.
Layout Discipline

Do not automatically turn every section into a card. Use the simplest appropriate layout. For example:

text
Sidebar
    |
    +-- Navigation
Main Content
    |
    +-- Page Header
    |
    +-- Schedule
    |
    +-- Reminders
A timetable should look like a timetable. A settings page should look like a settings page. A form should look like a form. Do not force every interface into the same card-based dashboard pattern.
Content Discipline

Never invent:

User data
Schedule entries
Statistics
Notifications
Testimonials
Reviews
Activity counts
Fake names
Fake analytics If sample data is required for development, clearly structure it as mock data and keep it realistic.
General Rule

Before adding a visual element, ask:

Does this improve usability or communicate information? If the answer is no, don't add it. The goal is not to make the application look "fancy." The goal is to make it look intentional, human-designed, and production-ready.