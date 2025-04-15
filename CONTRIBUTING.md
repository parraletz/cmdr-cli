# Contributing to cmdr CLI

## Commit Message Format

This project follows [Angular Commit Message Format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format). Commit messages should be structured as follows:

```
type(scope?): subject
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Rules

- The type must be one of the types listed above
- The subject must be in sentence case (first letter capitalized)
- The scope is optional and should be in lowercase
- The subject should not end with a period
- The header should not exceed 72 characters

### Examples

✅ Valid commit messages:

- feat: Add new task creation endpoint
- fix(api): Handle empty response in delete task
- docs(readme): Update installation instructions
- style: Format code according to prettier rules
- refactor(auth): Improve token validation logic

❌ Invalid commit messages:

- updated code (missing type)
- FIX: something (type in uppercase)
- feat: add new feature (subject not in sentence case)
- chore: update dependencies. (ends with period)
- fix(API): handle error (scope in uppercase)
