# Security Policy

## Reporting a Vulnerability

At CookFast, we take security seriously. We appreciate the work of security researchers in helping us maintain a secure application for our users.

### How to Report a Vulnerability

If you believe you've found a security vulnerability in CookFast, please follow these steps:

1. **Use GitHub's Private Vulnerability Reporting**: Go to the "Security" tab on our GitHub repository and click on "Report a vulnerability"

2. **Alternatively, contact maintainers directly**: If needed, you can email us at [INSERT EMAIL ADDRESS HERE] with the subject line "CookFast Security Vulnerability"

### What to Include in Your Report

Please include the following details in your vulnerability report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any potential solutions you've identified (optional)

### Our Commitment

We commit to:

- Responding to security reports within 48 hours
- Keeping reporters updated as we address the issue
- Giving proper credit to security researchers who help us improve our security (unless they prefer to remain anonymous)
- Not taking legal action against those who report vulnerabilities in good faith

## Security Measures

CookFast implements the following security measures:

- API keys are never stored by the application
- Keys are sent directly to the chosen AI provider for the generation request only
- API key validation happens client-side before submission
- Basic rate limiting is implemented to prevent abuse
- Regular dependency updates to patch known vulnerabilities

Thank you for helping keep CookFast and its users safe! 