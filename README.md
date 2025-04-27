# Cmdr CLI

A powerful CLI tool for generating project templates. This tool helps you quickly scaffold different types of projects with best practices and common configurations.

## Installation

```bash
# Using npm
npm install -g cmdr-cli

# Using pnpm
pnpm add -g cmdr-cli
```

## Usage

```bash
# Create a new project
cmdr create
```

## Available Templates

- **Terraform Project**: Basic Terraform configuration with AWS provider
- **Express.js API**: TypeScript-based Express.js API template
- **FastAPI Python Project**: Python FastAPI project template
- **GitHub Action**: GitHub Action template
- **Kubernetes Operator**: Kubernetes operator template using TypeScript
- **Kubernetes Manifests**: Basic Kubernetes manifests (Deployment + Service)
- **Kubernetes with Kustomize**: Multi-environment Kubernetes setup using Kustomize
- **Gitignore Template**: Generate .gitignore files for different project types

## Adding New Templates

To add a new template, follow these steps:

1. Create a new file in `src/templates/` (e.g., `my-template.ts`)

2. Define your template interface (if needed):

```typescript
interface MyTemplateOptions {
  // Define your template options here
  someOption?: string
  anotherOption?: number
}
```

3. Create your template generator function:

```typescript
export async function generateMyTemplate(projectName: string, options: MyTemplateOptions = {}) {
  const projectPath = path.join(process.cwd(), projectName)

  try {
    // Create project directory
    await fs.mkdir(projectPath)

    // Generate your files
    await fs.writeFile(path.join(projectPath, 'some-file.txt'), 'Your content here')

    // Add more files as needed
  } catch (error) {
    // Clean up if something goes wrong
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
    throw error
  }
}
```

4. Update `src/commands/create.ts`:
   - Import your new template
   - Add it to the choices array
   - Add any necessary prompts
   - Handle the template in the switch statement

Example:

```typescript
import { generateMyTemplate } from '../templates/my-template';

// Add to choices array
{
  name: 'My Template',
  value: 'my-template'
}

// Handle in switch statement
case 'my-template':
  await generateMyTemplate(projectName, options);
  break;
```

## Project Structure

```
.
├── src/
│   ├── commands/          # CLI commands
│   │   └── create.ts      # Project creation command
│   ├── templates/         # Project templates
│   │   ├── express.ts
│   │   ├── fastapi.ts
│   │   ├── kubernetes.ts
│   │   └── ...
│   ├── utils/            # Utility functions
│   │   └── gitignore.ts
│   └── index.ts          # CLI entry point
├── test/                 # Test files
├── package.json
└── tsconfig.json
```

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Link for local development
pnpm link
```

## Template Guidelines

When creating new templates, follow these guidelines:

1. **File Structure**:

   - Keep related files together
   - Use clear, descriptive names
   - Include a README.md in the generated project

2. **Configuration**:

   - Use sensible defaults
   - Make important values configurable via options
   - Document all configuration options

3. **Error Handling**:

   - Clean up partially created projects on failure
   - Provide helpful error messages
   - Validate user input

4. **Documentation**:
   - Include usage examples
   - Document all available options
   - Provide clear next steps after project creation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0) - see the [LICENSE.md](LICENSE.md) file for details.
