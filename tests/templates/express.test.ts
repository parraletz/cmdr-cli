import fs from 'fs-extra'
import path from 'path'
import { simpleGit } from 'simple-git'
import { generateExpressProject } from '../../src/templates/express'

// Mock simple-git
jest.mock('simple-git', () => {
  return {
    simpleGit: jest.fn().mockReturnValue({
      clone: jest.fn().mockResolvedValue(undefined),
      init: jest.fn().mockResolvedValue(undefined),
      add: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined)
    })
  }
})

// Mock fs-extra
jest.mock('fs-extra', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  writeJson: jest.fn().mockResolvedValue(undefined),
  readJson: jest.fn().mockResolvedValue({ name: 'express-typescript-service-template' }),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue('# Express.js TypeScript Service Template'),
  existsSync: jest.fn().mockReturnValue(true)
}))

describe('Express Template Generator', () => {
  const projectName = 'test-express-project'
  const projectPath = path.join(process.cwd(), projectName)
  const defaultRepo = 'https://github.com/parraletz/express-typescript-service-template.git'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up test project directory
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
  })

  it('should create a new Express project with git initialized by default', async () => {
    await generateExpressProject(projectName)

    // Verify git clone was called with default repository
    expect(simpleGit().clone).toHaveBeenCalledWith(defaultRepo, projectPath)

    // Verify .git directory was removed
    expect(fs.remove).toHaveBeenCalledWith(path.join(projectPath, '.git'))

    // Verify package.json was updated
    expect(fs.readJson).toHaveBeenCalledWith(path.join(projectPath, 'package.json'))
    expect(fs.writeJson).toHaveBeenCalledWith(
      path.join(projectPath, 'package.json'),
      expect.objectContaining({ name: projectName }),
      { spaces: 2 }
    )

    // Verify README.md was updated
    expect(fs.readFile).toHaveBeenCalledWith(path.join(projectPath, 'README.md'), 'utf-8')
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(projectPath, 'README.md'),
      expect.stringContaining(projectName)
    )

    // Verify git was initialized
    const projectGit = simpleGit(projectPath)
    expect(projectGit.init).toHaveBeenCalled()
    expect(projectGit.add).toHaveBeenCalledWith('.')
    expect(projectGit.commit).toHaveBeenCalledWith(
      'Initial commit from express-typescript-service-template'
    )
  })

  it('should create a new Express project without git when --no-git is specified', async () => {
    await generateExpressProject(projectName, { git: false })

    // Verify git clone was called with default repository
    expect(simpleGit().clone).toHaveBeenCalledWith(defaultRepo, projectPath)

    // Verify .git directory was removed
    expect(fs.remove).toHaveBeenCalledWith(path.join(projectPath, '.git'))

    // Verify package.json was updated
    expect(fs.readJson).toHaveBeenCalledWith(path.join(projectPath, 'package.json'))
    expect(fs.writeJson).toHaveBeenCalledWith(
      path.join(projectPath, 'package.json'),
      expect.objectContaining({ name: projectName }),
      { spaces: 2 }
    )

    // Verify README.md was updated
    expect(fs.readFile).toHaveBeenCalledWith(path.join(projectPath, 'README.md'), 'utf-8')
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(projectPath, 'README.md'),
      expect.stringContaining(projectName)
    )

    // Verify git was not initialized
    const projectGit = simpleGit(projectPath)
    expect(projectGit.init).not.toHaveBeenCalled()
    expect(projectGit.add).not.toHaveBeenCalled()
    expect(projectGit.commit).not.toHaveBeenCalled()
  })

  it('should create a new Express project from a custom repository', async () => {
    const customRepo = 'https://github.com/custom/repo.git'
    await generateExpressProject(projectName, { repository: customRepo })

    // Verify git clone was called with custom repository
    expect(simpleGit().clone).toHaveBeenCalledWith(customRepo, projectPath)

    // Verify .git directory was removed
    expect(fs.remove).toHaveBeenCalledWith(path.join(projectPath, '.git'))

    // Verify package.json was updated
    expect(fs.readJson).toHaveBeenCalledWith(path.join(projectPath, 'package.json'))
    expect(fs.writeJson).toHaveBeenCalledWith(
      path.join(projectPath, 'package.json'),
      expect.objectContaining({ name: projectName }),
      { spaces: 2 }
    )

    // Verify README.md was updated
    expect(fs.readFile).toHaveBeenCalledWith(path.join(projectPath, 'README.md'), 'utf-8')
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(projectPath, 'README.md'),
      expect.stringContaining(projectName)
    )

    // Verify git was initialized
    const projectGit = simpleGit(projectPath)
    expect(projectGit.init).toHaveBeenCalled()
    expect(projectGit.add).toHaveBeenCalledWith('.')
    expect(projectGit.commit).toHaveBeenCalledWith(
      'Initial commit from express-typescript-service-template'
    )
  })

  it('should clean up project directory if an error occurs', async () => {
    // Mock an error during git clone
    const mockError = new Error('Git clone failed')
    ;(simpleGit().clone as jest.Mock).mockRejectedValueOnce(mockError)

    // Verify the function throws the error
    await expect(generateExpressProject(projectName)).rejects.toThrow('Git clone failed')

    // Verify cleanup was performed
    expect(fs.remove).toHaveBeenCalledWith(projectPath)
  })
})
