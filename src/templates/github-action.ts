import fs from 'fs-extra'
import path from 'path'
import { simpleGit, SimpleGit } from 'simple-git'

export async function generateGithubActionProject(
  projectName: string,
  options: { git?: boolean } = {}
) {
  const projectPath = path.join(process.cwd(), projectName)
  const shouldInitializeGit = options.git !== false // Default to true if not explicitly set to false
  const git: SimpleGit = simpleGit()

  try {
    // Clone the repository
    console.log('Cloning the GitHub Action template...')
    await git.clone(
      'https://github.com/parraletz/add-reviewers-action.git',
      projectPath
    )

    // Remove the .git directory to start fresh
    await fs.remove(path.join(projectPath, '.git'))

    // Update package.json with the new project name
    const packageJsonPath = path.join(projectPath, 'package.json')
    const packageJson = await fs.readJson(packageJsonPath)
    packageJson.name = projectName
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 })

    // Update action.yml
    const actionYmlPath = path.join(projectPath, 'action.yml')
    let actionYmlContent = await fs.readFile(actionYmlPath, 'utf-8')
    actionYmlContent = actionYmlContent.replace(
      /name: 'add-reviewers-action'/,
      `name: '${projectName}'`
    )
    actionYmlContent = actionYmlContent.replace(
      /description: 'GitHub Action to add reviewers'/,
      `description: 'GitHub Action generated with Cmdr CLI'`
    )
    await fs.writeFile(actionYmlPath, actionYmlContent)

    // Update README.md
    const readmePath = path.join(projectPath, 'README.md')
    let readmeContent = await fs.readFile(readmePath, 'utf-8')
    readmeContent = readmeContent.replace(
      /# GitHub Action: Request Reviewers/,
      `# ${projectName}`
    )
    readmeContent = readmeContent.replace(
      /git clone <repository-url>/,
      `git clone YOUR_REPOSITORY_URL`
    )
    readmeContent = readmeContent.replace(/npm install/, `pnpm install`)
    await fs.writeFile(readmePath, readmeContent)

    // Initialize git repository if requested
    if (shouldInitializeGit) {
      console.log('Initializing git repository...')
      const projectGit = simpleGit(projectPath)
      await projectGit.init()
      await projectGit.add('.')
      await projectGit.commit(
        'Initial commit from add-reviewers-action template'
      )
    }
  } catch (error) {
    // Clean up if something goes wrong
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
    throw error
  }
}
