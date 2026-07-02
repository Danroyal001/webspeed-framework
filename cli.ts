import colors from 'colors';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import dbConnection from './database/connection';

const program = new Command();

program
    .name('webspeed')
    .description('CLI tool for WebSpeed CMS / Web Framework')
    .version('0.0.1');

// Command: serve / start
program
    .command('serve')
    .alias('start')
    .description('Start the WebSpeed development server')
    .action(async () => {
        console.log(colors.cyan('Starting WebSpeed Server...'));
        const init = (await import('./lib/index')).default;
        await init();
    });

// Command: make:controller
program
    .command('make:controller <name>')
    .description('Generate a new Routing Controller')
    .action(async (name) => {
        // Normalize name: capitalize first letter
        const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Controller';
        const fileName = `${className}.ts`;
        const filePath = path.join(__dirname, 'lib', 'routingControllers', fileName);

        if (fs.existsSync(filePath)) {
            console.log(colors.red(`Controller ${fileName} already exists.`));
            return;
        }

        const template = `import RoutingController, { RouteContext } from './RoutingController';

class ${className} extends RoutingController {
    constructor() {
        super('/${name.toLowerCase()}');
    }

    get(context: RouteContext) {
        return context.finish('Hello from ${className}!');
    }
}

export default new ${className}();
`;

        fs.writeFileSync(filePath, template, 'utf-8');
        console.log(colors.green(`Created controller: ${colors.bold(filePath)}`));

        // Automatically register in lib/routingControllers/index.ts
        const indexPath = path.join(__dirname, 'lib', 'routingControllers', 'index.ts');
        if (fs.existsSync(indexPath)) {
            let indexContent = fs.readFileSync(indexPath, 'utf-8');
            
            // Insert import line
            const importLine = `import ${name.toLowerCase()}Controller from "./${className}";`;
            indexContent = importLine + '\n' + indexContent;

            // Insert into routingControllers array
            indexContent = indexContent.replace(
                /const routingControllers = \[[^]*?\]/m,
                (match) => {
                    const inner = match.slice(match.indexOf('[') + 1, match.lastIndexOf(']')).trim();
                    const list = inner ? inner.split(',').map(s => s.trim()) : [];
                    list.push(`${name.toLowerCase()}Controller`);
                    return `const routingControllers = [\n    ${list.join(',\n    ')}\n]`;
                }
            );

            fs.writeFileSync(indexPath, indexContent, 'utf-8');
            console.log(colors.green('Registered controller in routingControllers index.ts'));
        }
    });

// Command: make:model
program
    .command('make:model <name>')
    .description('Generate a new ActiveRecord database model')
    .action(async (name) => {
        const className = name.charAt(0).toUpperCase() + name.slice(1);
        const fileName = `${className}.ts`;
        const filePath = path.join(__dirname, 'database', 'databaseModels', fileName);

        if (fs.existsSync(filePath)) {
            console.log(colors.red(`Model ${fileName} already exists.`));
            return;
        }

        const template = `import DatabaseModel from './DatabaseModel';

class ${className} extends DatabaseModel {
    readonly __collection: string = '${name.toLowerCase()}s';
}

export default ${className};
`;

        fs.writeFileSync(filePath, template, 'utf-8');
        console.log(colors.green(`Created model: ${colors.bold(filePath)}`));
    });

// Command: db:seed
program
    .command('db:seed')
    .description('Seed the active database with dummy/initial data')
    .action(async () => {
        console.log(colors.cyan('Connecting database for seeding...'));
        try {
            await dbConnection.connect();
            const User = (await import('./database/databaseModels/User')).default;

            console.log('Clearing existing users...');
            await User.query().delete();

            console.log('Inserting seed users...');
            const u1 = new User({ username: 'admin', email: 'admin@webspeed.io', role: 'admin' });
            await u1.__saveToDatabase();

            const u2 = new User({ username: 'editor', email: 'editor@webspeed.io', role: 'editor' });
            await u2.__saveToDatabase();

            console.log(colors.green('Database seeded successfully with users:'));
            console.log(colors.yellow(`- ${u1.username} (${u1.email}) [ID: ${u1.id}]`));
            console.log(colors.yellow(`- ${u2.username} (${u2.email}) [ID: ${u2.id}]`));
        } catch (error) {
            console.error(colors.red('Seeding failed:'), error);
        } finally {
            await dbConnection.disconnect();
        }
    });

program.parse(process.argv);

