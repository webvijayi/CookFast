# UI Component Documentation

This document provides detailed information about the key UI components used in the CookFast application. It covers purpose, props, structure, and usage patterns.

## Core Components

### EnhancedForm.tsx

**Purpose**: Collects and validates project details and user preferences.

**Structure**:
- Form with multiple sections for project details
- Provider selection and API key input
- Form validation and submission handling

**Key Props**:
- `onSubmit`: Function called with form data when submitted
- `onProviderChange`: Called when AI provider is changed
- `apiKey`: Current API key value
- `onApiKeyChange`: Called when API key is changed
- `onValidateKey`: Function to validate the API key

**State Management**:
- Manages form field values
- Tracks validation state
- Handles form submission

**Usage Example**:
```jsx
<EnhancedForm
  onSubmit={handleSubmit}
  onProviderChange={handleProviderChange}
  apiKey={apiKey}
  onApiKeyChange={handleApiKeyChange}
  onValidateKey={handleValidateKey}
/>
```

### GeneratorSection.tsx

**Purpose**: Controls the document generation process and displays results.

**Structure**:
- Generation controls (start, stop, retry)
- Progress indicators
- Result display and export options

**Key Props**:
- `projectDetails`: Project information to generate docs for
- `selectedDocs`: Document types to generate
- `provider`: Selected AI provider
- `apiKey`: API key for the selected provider
- `onSuccess`: Callback for successful generation
- `onError`: Callback for generation errors

**State Management**:
- Tracks generation status
- Manages abort controller for cancellation
- Handles result data

**Usage Example**:
```jsx
<GeneratorSection
  projectDetails={projectDetails}
  selectedDocs={selectedDocs}
  provider="openai"
  apiKey={apiKey}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

### MarkdownRenderer.tsx

**Purpose**: Renders Markdown content with support for Mermaid diagrams.

**Structure**:
- Markdown parser with GitHub-flavored Markdown support
- Mermaid diagram integration
- Syntax highlighting for code blocks

**Key Props**:
- `markdown`: The markdown string to render
- `className`: Additional CSS classes
- `theme`: Current theme (light/dark)

**Features**:
- Renders standard Markdown elements
- Support for Mermaid diagrams
- Code syntax highlighting
- Theme-aware rendering

**Usage Example**:
```jsx
<MarkdownRenderer
  markdown={documentContent}
  className="p-4 overflow-auto"
  theme={currentTheme}
/>
```

### DocumentTypeSection.tsx

**Purpose**: Allows users to select which document types to generate.

**Structure**:
- Checkboxes for each document type
- Descriptions and help text
- Selection controls

**Key Props**:
- `selectedDocs`: Currently selected document types
- `onChange`: Function called when selection changes
- `projectType`: Type of project (affects available documents)

**State Management**:
- Tracks selected document types
- Manages dependencies between document types

**Usage Example**:
```jsx
<DocumentTypeSection
  selectedDocs={selectedDocs}
  onChange={handleDocSelectionChange}
  projectType={projectDetails.projectType}
/>
```

## Supporting Components

### AnimatedHero.tsx

**Purpose**: Displays an animated hero section on the landing page.

**Structure**:
- Animated elements using Framer Motion
- Heading and subheading
- Call-to-action button

**Key Props**:
- `title`: Hero title text
- `subtitle`: Hero subtitle text
- `ctaText`: Call-to-action button text
- `onCtaClick`: Function called when CTA button is clicked

**Usage Example**:
```jsx
<AnimatedHero
  title="CookFast"
  subtitle="AI-Powered Project Documentation Generator"
  ctaText="Get Started"
  onCtaClick={() => scrollToSection('generator')}
/>
```

### FaqSection.tsx

**Purpose**: Displays frequently asked questions in an accordion format.

**Structure**:
- Accordion component for questions and answers
- Section title and description
- Expandable/collapsible items

**Usage Example**:
```jsx
<FaqSection />
```

### GenerationLogs.tsx

**Purpose**: Displays logs and debug information during generation.

**Structure**:
- Log entries with timestamps
- Filterable by log level
- Expandable details

**Key Props**:
- `logs`: Array of log entries to display
- `onClear`: Function to clear logs
- `showDebug`: Whether to show debug-level logs

**Usage Example**:
```jsx
<GenerationLogs
  logs={generationLogs}
  onClear={clearLogs}
  showDebug={showDebugLogs}
/>
```

### ThemeToggle.tsx

**Purpose**: Allows users to toggle between light and dark themes.

**Structure**:
- Toggle button with appropriate icons
- Integration with ThemeContext

**Usage Example**:
```jsx
<ThemeToggle />
```

## UI Component Patterns

### Form Design Pattern

The form implementation follows these patterns:
- Progressive disclosure of form fields
- Immediate validation feedback
- Clear error messages
- Accessible form controls

### Card-Based Layout

UI components are organized using a card-based layout:
- Clear visual hierarchy
- Consistent spacing and padding
- Proper use of borders and shadows
- Responsive behavior

### Responsive Design

Components implement responsive design with:
- Mobile-first approach
- Breakpoint-specific layouts
- Flexible sizing
- Touch-friendly controls

### Feedback and Progress

User feedback is provided through:
- Loading indicators
- Progress feedback during generation
- Success/error messages
- Animation for state changes

## Component Best Practices

1. **Accessibility**: All components use appropriate ARIA attributes and keyboard navigation

2. **Error Handling**: Components gracefully handle and display errors

3. **Performance**: Components use appropriate React hooks for performance optimization

4. **Theming**: All components respect the application's theming system

5. **Composition**: Components follow composition over inheritance principles 