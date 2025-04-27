import fs from 'fs-extra'
import path from 'path'

export async function generateGitignore(projectPath: string, gitignoreTemplate: string) {
  const response = await fetch(
    `https://www.toptal.com/developers/gitignore/api/${gitignoreTemplate}`
  )

  const content = await response.text()
  await fs.writeFile(path.join(projectPath, '.gitignore'), content)
}
