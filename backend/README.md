# ChatApp

This repository holds the source code for the final project of the class Web development

## Installation

### First time

If you are cloning this repository for the first time, please do the following:

- Install NodeJS and pnpm
- Run `pnpm i` to install dependencies
- Set your `.env` file using the `.env_example` template.
- (Optional) Install lazygit to trivialize git usage

### First time initialization

- Run `pnpm dlx prisma migrate dev --name init` to initialize the database
- Run `pnpm dlx prisma generate` to initialize the prisma client
- Run `pnpm swagger` to generate the swagger document

### Commits

Please add your item using lazygit or manual commits and follow the commit conventions. This will help others be able to know what you have done during your time working with the repo.

Additionally, please consider adding few items at the time, going in slightly more details on what you have done. Doing this will help with rollbacks for mistakes you've made.
