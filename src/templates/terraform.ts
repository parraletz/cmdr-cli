import fs from 'fs-extra'
import path from 'path'
import { simpleGit, SimpleGit } from 'simple-git'

export async function generateTerraformProject(
  projectName: string,
  options: { git?: boolean } = {}
) {
  const projectPath = path.join(process.cwd(), projectName)
  const shouldInitializeGit = options.git !== false
  const git: SimpleGit = simpleGit()

  try {
    // Create project directory
    await fs.mkdir(projectPath)

    // Create main.tf
    await fs.writeFile(
      path.join(projectPath, 'main.tf'),
      `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

# Add your resources here
`
    )

    // Create variables.tf
    await fs.writeFile(
      path.join(projectPath, 'variables.tf'),
      `variable "environment" {
  description = "Environment name"
  }

variable "project_name" {
  description = "Name of the project"
}
`
    )

    // Create outputs.tf
    await fs.writeFile(
      path.join(projectPath, 'outputs.tf'),
      `output "project_name" {
  value = var.project_name
}
`
    )

    // Create .gitignore
    await fs.writeFile(
      path.join(projectPath, '.gitignore'),
      `.terraform
*.tfstate
*.tfstate.*
.terraform.lock.hcl
`
    )

    // Create README.md
    await fs.writeFile(
      path.join(projectPath, 'README.md'),
      `# ${projectName}

This is a Terraform project generated using Parraletz CLI.

## Getting Started

1. Initialize Terraform:
   \`\`\`bash
   terraform init
   \`\`\`

2. Plan your changes:
   \`\`\`bash
   terraform plan
   \`\`\`

3. Apply your changes:
   \`\`\`bash
   terraform apply
   \`\`\`
`
    )

    // Initialize git repository if requested
    if (shouldInitializeGit) {
      console.log('Initializing git repository...')
      const projectGit = simpleGit(projectPath)
      await projectGit.init()
      await projectGit.add('.')
      await projectGit.commit('Initial commit')
    }
  } catch (error) {
    // Clean up if something goes wrong
    if (fs.existsSync(projectPath)) {
      await fs.remove(projectPath)
    }
    throw error
  }
}
