import fs from 'fs-extra'
import path from 'path'

/**
 * Generates a .gitignore file for the specified project using the gitignore.io API
 * @param projectPath - The path where the .gitignore file will be created
 * @param templates - Array of template names (e.g., ['node', 'python', 'vscode'])
 */
export async function generateGitignore(
  projectPath: string,
  templates: string[]
) {
  try {
    const apiUrl = `https://www.toptal.com/developers/gitignore/api/${templates.join(
      ','
    )}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch gitignore template: ${response.statusText}`
      )
    }

    const content = await response.text()
    await fs.writeFile(path.join(projectPath, '.gitignore'), content)
  } catch (error) {
    console.error('Error generating .gitignore file:', error)
    throw error
  }
}
