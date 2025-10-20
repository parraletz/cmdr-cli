import chalk from 'chalk'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import ora from 'ora'
import { generateExpressProject } from '../templates/express'
import { generateExpressBasicProject } from '../templates/express-basic'
import { generateExpressHexagonalProject } from '../templates/express-hexagonal'
import { generateFastApiProject } from '../templates/fastapi'
import { generateGithubActionProject } from '../templates/github-action'
import { generateGitignore } from '../templates/gitignore'
import { generateK8sOperatorProject } from '../templates/k8s-operator'
import { generateKubernetesProject } from '../templates/kubernetes'
import { generateKubernetesKustomizeProject } from '../templates/kubernetes-kustomize'
import { generateTerraformProject } from '../templates/terraform'
import { generateTypescriptLibraryProject } from '../templates/typescript-library'

export async function createProject() {
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project do you want to create?',
      choices: [
        { name: 'Terraform Project', value: 'terraform' },
        { name: 'Express.js API', value: 'express' },
        { name: 'Express.js 5', value: 'express-basic' },
        { name: 'Express Hexagonal Architecture Boilerplate', value: 'express-hexagonal' },
        { name: 'FastAPI Python Project', value: 'fastapi' },
        { name: 'GitHub Action', value: 'github-action' },
        { name: 'Kubernetes Operator', value: 'k8s-operator' },
        { name: 'Kubernetes Manifests', value: 'kubernetes' },
        { name: 'Kubernetes with Kustomize', value: 'kubernetes-kustomize' },
        { name: 'Gitignore Template', value: 'gitignore' },
        { name: 'TypeScript Library', value: 'typescript-library' }
      ]
    }
  ])

  let gitignoreTemplate: string | undefined
  let projectPath: string | undefined
  let projectName: string | undefined
  let kubernetesOptions: { image?: string; port?: number; replicas?: number } = {}

  if (projectType === 'gitignore') {
    const result = await inquirer.prompt([
      {
        type: 'input',
        name: 'gitignoreTemplate',
        message: 'Enter the gitignore template name:',
        default: 'node'
      },
      {
        type: 'input',
        name: 'projectPath',
        message: 'Enter the project path:',
        default: process.cwd()
      }
    ])
    gitignoreTemplate = result.gitignoreTemplate
    projectPath = result.projectPath
  } else if (projectType === 'kubernetes' || projectType === 'kubernetes-kustomize') {
    const result = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        validate: (input: string) => {
          if (!input) return 'Project name is required'
          if (fs.existsSync(input)) return 'Directory already exists'
          return true
        }
      },
      {
        type: 'input',
        name: 'image',
        message: 'Enter the container image:',
        default: 'nginx:latest'
      },
      {
        type: 'number',
        name: 'port',
        message: 'Enter the container port:',
        default: 80
      },
      {
        type: 'number',
        name: 'replicas',
        message: 'Enter the number of replicas:',
        default: 1
      }
    ])
    projectName = result.projectName
    kubernetesOptions = {
      image: result.image,
      port: result.port,
      replicas: result.replicas
    }
  } else {
    const result = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        validate: (input: string) => {
          if (!input) return 'Project name is required'
          if (fs.existsSync(input)) return 'Directory already exists'
          return true
        }
      }
    ])
    projectName = result.projectName
  }

  const spinner = ora('Creating project...').start()

  try {
    switch (projectType) {
      case 'terraform':
        await generateTerraformProject(projectName!)
        break
      case 'express':
        await generateExpressProject(projectName!)
        break
      case 'express-basic':
        await generateExpressBasicProject(projectName!)
        break
      case 'express-hexagonal':
        await generateExpressHexagonalProject(projectName!)
        break
      case 'typescript-library':
        await generateTypescriptLibraryProject(projectName!)
        break
      case 'fastapi':
        await generateFastApiProject(projectName!)
        break
      case 'github-action':
        await generateGithubActionProject(projectName!)
        break
      case 'k8s-operator':
        await generateK8sOperatorProject(projectName!)
        break
      case 'kubernetes':
        await generateKubernetesProject(projectName!, kubernetesOptions)
        break
      case 'kubernetes-kustomize':
        await generateKubernetesKustomizeProject(projectName!, kubernetesOptions)
        break
      case 'gitignore':
        await generateGitignore(projectPath!, gitignoreTemplate!)
        break
    }

    spinner.succeed(chalk.green('Project created successfully!'))
    console.log(chalk.blue('\nNext steps:'))

    if (projectType !== 'gitignore') {
      console.log(`  cd ${projectName}`)

      if (projectType === 'fastapi') {
        console.log('  uv sync')
        console.log('  ENVIRONMENT=local uv run python main.py')
      } else if (projectType === 'kubernetes') {
        console.log('  kubectl apply -f deployment.yaml')
        console.log('  kubectl apply -f service.yaml')
      } else {
        console.log('  pnpm install')

        if (projectType === 'k8s-operator') {
          console.log('\nAdditional steps for Kubernetes Operator:')
          console.log('  1. Configure your Kubernetes cluster access')
          console.log('  2. Update the CRD in example/example.yaml')
          console.log('  3. Run tests: pnpm test')
          console.log('  4. Build and deploy: pnpm build && kubectl apply -f deploy/')
        }
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'))
    throw error
  }
}
