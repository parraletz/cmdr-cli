import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs-extra'
import path from 'path'
import { generateTerraformProject } from '../templates/terraform'
import { generateExpressProject } from '../templates/express'
import { generateFastApiProject } from '../templates/fastapi'
import { generateGithubActionProject } from '../templates/github-action'
import { generateK8sOperatorProject } from '../templates/k8s-operator'

export async function createProject() {
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project do you want to create?',
      choices: [
        { name: 'Terraform Project', value: 'terraform' },
        { name: 'Express.js API', value: 'express' },
        { name: 'FastAPI Python Project', value: 'fastapi' },
        { name: 'GitHub Action', value: 'github-action' },
        { name: 'Kubernetes Operator', value: 'k8s-operator' },
      ],
    },
  ])

  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      validate: (input: string) => {
        if (!input) return 'Project name is required'
        if (fs.existsSync(input)) return 'Directory already exists'
        return true
      },
    },
  ])

  const spinner = ora('Creating project...').start()

  try {
    switch (projectType) {
      case 'terraform':
        await generateTerraformProject(projectName)
        break
      case 'express':
        await generateExpressProject(projectName)
        break
      case 'fastapi':
        await generateFastApiProject(projectName)
        break
      case 'github-action':
        await generateGithubActionProject(projectName)
        break
      case 'k8s-operator':
        await generateK8sOperatorProject(projectName)
        break
    }

    spinner.succeed(chalk.green('Project created successfully!'))
    console.log(chalk.blue('\nNext steps:'))
    console.log(`  cd ${projectName}`)

    if (projectType === 'fastapi') {
      console.log('  python -m venv venv')
      console.log(
        '  source venv/bin/activate  # On Windows: venv\\Scripts\\activate'
      )
      console.log('  pip install -r requirements.txt')
    } else {
      console.log('  pnpm install')

      if (projectType === 'k8s-operator') {
        console.log('\nAdditional steps for Kubernetes Operator:')
        console.log('  1. Configure your Kubernetes cluster access')
        console.log('  2. Update the CRD in example/example.yaml')
        console.log('  3. Run tests: pnpm test')
        console.log(
          '  4. Build and deploy: pnpm build && kubectl apply -f deploy/'
        )
      }
    }
  } catch (error) {
    spinner.fail(chalk.red('Failed to create project'))
    throw error
  }
}
