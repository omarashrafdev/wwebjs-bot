# Contributing to WhatsApp API Server

Thank you for your interest in contributing to the WhatsApp API Server! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/wwebjs-bot.git
   cd wwebjs-bot
   ```
3. **Set up the development environment**:
   ```bash
   cp .env.example .env
   ./deploy.sh dev
   ```

### Development Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly:
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add new bulk messaging template system"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

## 📋 Contribution Guidelines

### Code Style

- **JavaScript**: Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- **Indentation**: Use 2 spaces (no tabs)
- **Semicolons**: Always use semicolons
- **Quotes**: Use single quotes for strings
- **Line endings**: Use LF (Unix-style)

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(api): add message scheduling functionality
fix(auth): resolve API key validation issue
docs(readme): update installation instructions
test(routes): add tests for bulk messaging endpoint
```

### Pull Request Guidelines

#### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Self-review of code changes completed
- [ ] Tests added for new functionality
- [ ] Tests pass locally
- [ ] Documentation updated if needed
- [ ] No breaking changes (unless discussed)

#### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues** to avoid duplicates
2. **Test with the latest version**
3. **Gather relevant information**:
   - Operating system and version
   - Node.js version
   - Browser version (if applicable)
   - Steps to reproduce
   - Expected vs actual behavior

### Bug Report Template
```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Environment
- OS: [e.g. macOS 12.0, Ubuntu 20.04, Windows 10]
- Node.js: [e.g. 18.17.0]
- Browser: [e.g. Chrome 96, Safari 15]
- Version: [e.g. 1.0.0]

## Additional Context
Add any other context about the problem here.
```

## 💡 Feature Requests

### Suggesting Features
1. **Check existing issues** and discussions
2. **Provide detailed description** of the feature
3. **Explain the use case** and benefits
4. **Consider implementation complexity**

### Feature Request Template
```markdown
## Feature Description
A clear and concise description of what you want to happen.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
A detailed description of the proposed implementation.

## Alternatives Considered
Any alternative solutions or features you've considered.

## Additional Context
Any other context, screenshots, or examples.
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Test Structure
```javascript
describe('WhatsApp Service', () => {
  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      // Arrange
      const message = 'Test message';
      const number = '1234567890';
      
      // Act
      const result = await whatsappService.sendMessage(number, message);
      
      // Assert
      expect(result.success).toBe(true);
    });
  });
});
```

## 📚 Documentation

### Types of Documentation
- **API Documentation**: Endpoint specifications and examples
- **User Guides**: Step-by-step instructions for users
- **Developer Guides**: Technical implementation details
- **README Updates**: Installation and quick start information

### Documentation Standards
- Use clear, concise language
- Include code examples where appropriate
- Update both inline comments and external documentation
- Ensure examples are tested and working

## 🔐 Security Considerations

### Security Guidelines
- **Never commit secrets** or API keys
- **Validate all inputs** in API endpoints
- **Follow OWASP guidelines** for web security
- **Use parameterized queries** for database operations
- **Implement proper error handling** without exposing internal details

### Reporting Security Issues
**DO NOT** open public issues for security vulnerabilities. Instead:
1. Email security@yourproject.com
2. Include detailed description and reproduction steps
3. Allow time for investigation and fix before disclosure

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git

### Local Development
```bash
# Clone and setup
git clone https://github.com/yourproject/wwebjs-bot.git
cd wwebjs-bot

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development environment
./deploy.sh dev
```

### Docker Development
```bash
# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🎯 Project Areas for Contribution

### High Priority
- [ ] Message scheduling functionality
- [ ] Advanced analytics and reporting
- [ ] Multi-session support
- [ ] Webhook system for incoming messages
- [ ] Message template management interface

### Medium Priority
- [ ] Integration with external databases
- [ ] User management and RBAC
- [ ] API usage monitoring
- [ ] Automated testing improvements
- [ ] Performance optimizations

### Low Priority
- [ ] CRM system integrations
- [ ] Advanced UI/UX improvements
- [ ] Mobile app development
- [ ] Plugin system architecture

## 📞 Getting Help

### Resources
- **Documentation**: Check the README and wiki
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord server
- **Email**: Contact maintainers at maintainers@yourproject.com

### Support Channels
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **General Questions**: GitHub Discussions or Discord
- **Security Issues**: security@yourproject.com

## 👥 Maintainers

### Current Maintainers
- **Project Lead**: [Your Name] - [@yourusername]
- **API Development**: [Name] - [@username]
- **DevOps/Infrastructure**: [Name] - [@username]
- **Documentation**: [Name] - [@username]

### Responsibilities
- **Code Review**: All maintainers review pull requests
- **Release Management**: Project lead coordinates releases
- **Issue Triage**: Maintainers triage and label issues
- **Community Management**: Active participation in discussions

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License). See [LICENSE](LICENSE) file for details.

## 🙏 Recognition

Contributors are recognized in:
- **Contributors section** in README
- **Release notes** for significant contributions
- **Hall of Fame** for long-term contributors
- **Special thanks** in project documentation

---

**Thank you for contributing to the WhatsApp API Server!** 🎉

Your contributions help make this project better for everyone. Whether you're fixing bugs, adding features, improving documentation, or helping other users, every contribution is valued and appreciated.

---

**Questions?** Don't hesitate to reach out through any of our support channels. We're here to help you contribute successfully!