import fs from 'fs-extra'
import path from 'path'
import { simpleGit, SimpleGit } from 'simple-git'
import { generateGitignore } from '../utils/gitignore'

interface FastAPIProjectOptions {
  git?: boolean
  repository?: string
}

export async function generateFastApiProject(
  projectName: string,
  options: FastAPIProjectOptions = {}
) {
  const projectPath = path.join(process.cwd(), projectName)
  const shouldInitializeGit = options.git !== false // Default to true if not explicitly set to false
  const git: SimpleGit = simpleGit()
  const repository =
    options.repository ||
    'https://github.com/parraletz/fastapi-service-template.git'

  try {
    // Clone the repository
    console.log(`Cloning the FastAPI template from ${repository}...`)
    await git.clone(repository, projectPath)

    // Remove the .git directory to start fresh
    await fs.remove(path.join(projectPath, '.git'))

    // Generate .gitignore file using the utility
    await generateGitignore(projectPath, ['python', 'venv', 'vscode'])

    // Create project files
    await fs.writeFile(
      path.join(projectPath, 'requirements.txt'),
      'fastapi\nuvicorn\npython-dotenv\n'
    )

    await fs.writeFile(
      path.join(projectPath, 'main.py'),
      `from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
`
    )

    await fs.writeFile(
      path.join(projectPath, '.env'),
      'PORT=8000\nENVIRONMENT=development\n'
    )

    await fs.writeFile(
      path.join(projectPath, 'README.md'),
      `# ${projectName}

A FastAPI project.

## Setup

1. Create virtual environment:
    \`\`\`bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\\Scripts\\activate
    \`\`\`

2. Install dependencies:
    \`\`\`bash
    pip install -r requirements.txt
    \`\`\`

3. Run the server:
    \`\`\`bash
    uvicorn main:app --reload
    \`\`\`

Visit http://localhost:8000/docs for the API documentation.`
    )

    // Initialize git if not disabled
    if (shouldInitializeGit) {
      console.log('Initializing git repository...')
      await git.init()
      await git.add('.')
      await git.commit('Initial commit')
    }
  } catch (error) {
    // Clean up if something goes wrong
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
    throw error
  }
}
