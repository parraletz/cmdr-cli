import fs from 'fs-extra'
import path from 'path'
import { simpleGit } from 'simple-git'
import { generateGithubActionProject } from '../../src/templates/github-action'

// Mock simple-git
jest.mock('simple-git', () => {
  return {
    simpleGit: jest.fn().mockReturnValue({
      clone: jest.fn().mockResolvedValue(undefined),
      init: jest.fn().mockResolvedValue(undefined),
      add: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
    }),
  }
})

// Mock fs-extra
jest.mock('fs-extra', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(undefined),
  writeJson: jest.fn().mockResolvedValue(undefined),
  readJson: jest.fn().mockResolvedValue({ name: 'add-reviewers-action' }),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockImplementation((filePath: string) => {
    if (filePath.endsWith('action.yml')) {
      return Promise.resolve(`name: 'add-reviewers-action'
description: 'GitHub Action to add reviewers'`)
    }
    if (filePath.endsWith('README.md')) {
      return Promise.resolve('# GitHub Action: Request Reviewers')
    }
    return Promise.resolve('')
  }),
  existsSync: jest.fn().mockReturnValue(true),
}))

describe('GitHub Action Template Generator', () => {
  const projectName = 'test-github-action'
  const projectPath = path.join(process.cwd(), projectName)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(async () => {
    // Clean up test project directory
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
  })

  it('should create a new GitHub Action project with git initialized by default', async () => {
    await generateGithubActionProject(projectName)

    // Verify git clone was called
    expect(simpleGit().clone).toHaveBeenCalledWith(
      'https://github.com/parraletz/add-reviewers-action.git',
      projectPath
    )

    // Verify .git directory was removed
    expect(fs.remove).toHaveBeenCalledWith(path.join(projectPath, '.git'))

    // Verify package.json was updated
    expect(fs.readJson).toHaveBeenCalledWith(
      path.join(projectPath, 'package.json')
    )
    expect(fs.writeJson).toHaveBeenCalledWith(
      path.join(projectPath, 'package.json'),
      expect.objectContaining({ name: projectName }),
      { spaces: 2 }
    )

    // Verify action.yml was updated
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(projectPath, 'action.yml'),
      'utf-8'
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(projectPath, 'action.yml'),
      expect.stringContaining(`name: '${projectName}'`)
    )

    // Verify README.md was updated
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(projectPath, 'README.md'),
      'utf-8'
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(projectPath, 'README.md'),
      expect.stringContaining(projectName)
    )

    // Verify git was initialized
    const projectGit = simpleGit(projectPath)
    expect(projectGit.init).toHaveBeenCalled()
    expect(projectGit.add).toHaveBeenCalledWith('.')
    expect(projectGit.commit).toHaveBeenCalledWith(
      'Initial commit from add-reviewers-action template'
    )
  })

  it('should create a new GitHub Action project without git when --no-git is specified', async () => {
    await generateGithubActionProject(projectName, { git: false })

    // Verify git clone was called
    expect(simpleGit().clone).toHaveBeenCalledWith(
      'https://github.com/parraletz/add-reviewers-action.git',
      projectPath
    )

    // Verify .git directory was removed
    expect(fs.remove).toHaveBeenCalledWith(path.join(projectPath, '.git'))

    // Verify package.json was updated
    expect(fs.readJson).toHaveBeenCalledWith(
      path.join(projectPath, 'package.json')
    )
    expect(fs.writeJson).toHaveBeenCalledWith(
      path.join(projectPath, 'package.json'),
      expect.objectContaining({ name: projectName }),
      { spaces: 2 }
    )

    // Verify action.yml was updated
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(projectPath, 'action.yml'),
      'utf-8'
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(projectPath, 'action.yml'),
      expect.stringContaining(`name: '${projectName}'`)
    )

    // Verify README.md was updated
    expect(fs.readFile).toHaveBeenCalledWith(
      path.join(projectPath, 'README.md'),
      'utf-8'
    )
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

  it('should clean up project directory if an error occurs', async () => {
    // Mock an error during git clone
    const mockError = new Error('Git clone failed')
    ;(simpleGit().clone as jest.Mock).mockRejectedValueOnce(mockError)

    // Verify the function throws the error
    await expect(generateGithubActionProject(projectName)).rejects.toThrow(
      'Git clone failed'
    )

    // Verify cleanup was performed
    expect(fs.remove).toHaveBeenCalledWith(projectPath)
  })
})
