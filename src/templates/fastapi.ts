import fs from 'fs-extra'
import path from 'path'
import { simpleGit, SimpleGit } from 'simple-git'

export async function generateFastApiProject(
  projectName: string,
  options: {
    git?: boolean
    repository?: string
  } = {}
) {
  const projectPath = path.join(process.cwd(), projectName)
  const shouldInitializeGit = options.git !== false
  const git: SimpleGit = simpleGit()
  const repository = options.repository || 'https://github.com/parraletz/fastapi-template.git'

  try {
    // Clone the repository
    console.log(`Cloning the FastAPI template from ${repository}...`)
    await git.clone(repository, projectPath)

    // Remove the .git directory to start fresh
    await fs.remove(path.join(projectPath, '.git'))

    // Update README.md
    const readmePath = path.join(projectPath, 'README.md')
    let readmeContent = await fs.readFile(readmePath, 'utf-8')
    readmeContent = readmeContent.replace(/# Platform API/, `# ${projectName}`)
    readmeContent = readmeContent.replace(
      /git clone https:\/\/github\.com\/parraletz\/fastapi-template\.git/,
      `git clone YOUR_REPOSITORY_URL`
    )
    await fs.writeFile(readmePath, readmeContent)

    // Initialize git repository if requested
    if (shouldInitializeGit) {
      console.log('Initializing git repository...')
      const projectGit = simpleGit(projectPath)
      await projectGit.init()
      await projectGit.add('.')
      await projectGit.commit('Initial commit from fastapi-template')
    }
  } catch (error) {
    // Clean up if something goes wrong
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
    throw error
  }
}
