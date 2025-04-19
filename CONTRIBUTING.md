# Contributing to CookFast 🍳🚀

Thank you for your interest in contributing to CookFast! This document provides guidelines and instructions for contributing to the project. We welcome all types of contributions, whether it's bug reports, feature suggestions, code contributions, or documentation improvements.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Code Contributions](#code-contributions)
- [Development Workflow](#development-workflow)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
  - [Making Changes](#making-changes)
  - [Submitting a Pull Request](#submitting-a-pull-request)
- [Style Guides](#style-guides)
  - [Git Commit Messages](#git-commit-messages)
  - [JavaScript/TypeScript Style Guide](#javascripttypescript-style-guide)
  - [CSS Style Guide](#css-style-guide)
- [Additional Notes](#additional-notes)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct, which is to treat all contributors with respect and foster an inclusive and welcoming community.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for CookFast. Following these guidelines helps maintainers understand your report, reproduce the issue, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as much detail as possible.
- **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
- **Describe the behavior you observed** after following the steps and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead** and why.
- **Include screenshots and/or animated GIFs** which show you following the described steps and clearly demonstrate the problem.
- **If the problem is related to performance or memory**, include a performance profile capture with your report.
- **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened.

### Suggesting Features

This section guides you through submitting an enhancement suggestion for CookFast, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible.
- **Provide specific examples to demonstrate the steps** or point out the part of CookFast which the suggestion is related to.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Explain why this enhancement would be useful** to most CookFast users.
- **List some other applications where this enhancement exists**, if applicable.

### Code Contributions

- **Follow the [development workflow](#development-workflow)**.
- **Follow the [style guides](#style-guides)**.
- **Document new code** based on the project's documentation style.
- **End all files with a newline**.

## Development Workflow

### Setting Up the Development Environment

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/your-username/CookFast.git`
3. Navigate to the project directory: `cd CookFast`
4. Install dependencies: `npm install`
5. Start the development server: `npm run dev`

### Making Changes

1. Create a new branch: `git checkout -b my-branch-name`
2. Make your changes.
3. Test your changes.
4. Commit your changes with a descriptive commit message.

### Submitting a Pull Request

1. Push to your fork: `git push origin my-branch-name`
2. Open a pull request from your branch to the main repository.
3. Follow the pull request template to describe your changes.
4. Wait for a maintainer to review your pull request.

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Style Guide

- Use TypeScript for all new code.
- Follow the existing code style in the project.
- Use meaningful variable and function names.
- Document functions and complex code blocks with comments.
- Use async/await instead of promises where possible.
- Write unit tests for new functionality.

### CSS Style Guide

- Use Tailwind CSS for styling.
- Follow the shadcn/ui component patterns for consistency.
- Use CSS variables for theming when needed.
- Ensure responsive design for all new components.

## Additional Notes

Thank you for contributing to CookFast! Your time and effort help make this project better for everyone. 