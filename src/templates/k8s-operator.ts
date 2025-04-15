import fs from 'fs-extra'
import path from 'path'
import { simpleGit, SimpleGit } from 'simple-git'

export async function generateK8sOperatorProject(
  projectName: string,
  options: { git?: boolean } = {}
) {
  const projectPath = path.join(process.cwd(), projectName)
  const shouldInitializeGit = options.git !== false // Default to true if not explicitly set to false
  const git: SimpleGit = simpleGit()

  try {
    // Clone the repository
    console.log('Cloning the Kubernetes Operator template...')
    await git.clone(
      'https://github.com/parraletz/k8s-operator-template.git',
      projectPath
    )

    // Remove the .git directory to start fresh
    await fs.remove(path.join(projectPath, '.git'))

    // Update package.json with the new project name
    const packageJsonPath = path.join(projectPath, 'package.json')
    const packageJson = await fs.readJson(packageJsonPath)
    packageJson.name = projectName
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

    // Update README.md
    const readmePath = path.join(projectPath, 'README.md')
    let readmeContent = await fs.readFile(readmePath, 'utf-8')
    readmeContent = readmeContent.replace(
      /# Kubernetes Operator Template/,
      `# ${projectName}`
    )
    readmeContent = readmeContent.replace(
      /git clone https:\/\/github\.com\/parraletz\/k8s-operator-template\.git/,
      `git clone YOUR_REPOSITORY_URL`
    )
    await fs.writeFile(readmePath, readmeContent)

    // Initialize git repository if requested
    if (shouldInitializeGit) {
      console.log('Initializing git repository...')
      const projectGit = simpleGit(projectPath)
      await projectGit.init()
      await projectGit.add('.')
      await projectGit.commit('Initial commit from k8s-operator-template')
    }
  } catch (error) {
    // Clean up if something goes wrong
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
    throw error
  }
}
