#!/usr/bin/env node

import { Command } from 'commander'
import { createProject } from './commands/create'
import chalk from 'chalk'

const program = new Command()

program
  .name('cmdr')
  .description('CLI tool for generating project templates')
  .version('1.0.0')

program
  .command('create')
  .description('Create a new project from a template')
  .action(async () => {
    try {
      await createProject()
    } catch (error) {
      console.error(chalk.red('Error:'), error)
      process.exit(1)
    }
  })

program.parse()
