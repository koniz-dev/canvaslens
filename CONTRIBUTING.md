# Contributing to CanvasLens

Thank you for your interest in contributing to CanvasLens! We welcome contributions from the community.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Git

### Setting up the development environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/canvaslens.git
   cd canvaslens
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Open examples in your browser to test:
   - `examples/basic-image-viewer.html`
   - `examples/zoom-pan-demo.html`
   - `examples/annotation-demo.html`
   - `examples/comparison-demo.html`

## Development Workflow

### Project Structure
```
src/
├── core/              # Core canvas functionality
│   └── Canvas.ts
├── modules/           # Feature modules
│   ├── image-viewer/  # Module 1: Basic image display
│   ├── zoom-pan/      # Module 2: Zoom and pan
│   ├── annotation/    # Module 3: Annotations
│   └── comparison/    # Module 4: Image comparison
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── index.ts           # Main entry point

examples/              # HTML demo files
```

### Building and Testing
- `npm run build` - Build the library
- `npm run dev` - Watch mode for development
- `npm run clean` - Clean build artifacts

### Code Style
- Use TypeScript with strict mode
- Follow existing code patterns and naming conventions
- Add proper JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions focused and small

### Making Changes

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Build and test your changes:
   ```bash
   npm run build
   ```

4. Test with the HTML examples to ensure everything works

5. Commit your changes with a clear message:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request on GitHub

## Types of Contributions

### Bug Fixes
- Look for issues labeled "bug"
- Include steps to reproduce the issue
- Add tests if applicable

### New Features
- Discuss major changes in an issue first
- Follow the modular architecture
- Add examples and documentation
- Ensure TypeScript compatibility

### Documentation
- Improve README, API docs, or code comments
- Add or improve examples
- Fix typos or unclear explanations

### Performance Improvements
- Profile before and after changes
- Consider memory usage and rendering performance
- Test with large images and many annotations

## Module Development Guidelines

### Core Principles
1. **Modularity**: Each module should be independent and reusable
2. **Type Safety**: Use TypeScript strictly with proper type definitions
3. **Performance**: Consider canvas rendering performance
4. **API Consistency**: Follow existing patterns for method naming and structure

### Adding a New Module
1. Create directory in `src/modules/your-module/`
2. Implement core functionality with proper TypeScript types
3. Add to main exports in `src/index.ts`
4. Create HTML demo in `examples/`
5. Update README.md with new features
6. Add to CHANGELOG.md

### Event Handling
- Use the existing EventHandlers interface
- Add new event types to `src/types/index.ts`
- Follow the pattern of optional event handlers
- Provide meaningful event data

### Canvas Integration
- Use the Canvas class for all canvas operations
- Apply proper view transformations
- Handle coordinate conversion correctly
- Clean up resources in destroy methods

## Pull Request Process

1. Ensure your code builds without errors
2. Test with all example files
3. Update documentation if needed
4. Add entry to CHANGELOG.md
5. Fill out the pull request template
6. Be responsive to code review feedback

## Code Review Guidelines

### For Contributors
- Be open to feedback and suggestions
- Explain your approach and reasoning
- Test edge cases and error conditions
- Consider backward compatibility

### For Reviewers
- Be constructive and specific in feedback
- Test the changes locally
- Consider performance and maintainability
- Check for proper TypeScript usage

## Getting Help

- Open an issue for questions or discussions
- Check existing issues and pull requests
- Look at the examples for usage patterns
- Read the API documentation in README.md

## License

By contributing to CanvasLens, you agree that your contributions will be licensed under the MIT License.
