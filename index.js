const chalk = require('chalk');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const getQuery = require('./lib/query');

dotenv.config();

const accessToken = process.env.GITHUB_TOKEN;
const repositories = require('./repositories.json');

const queries = repositories.map((repo) => getQuery(repo));

const query = `
  query {
    ${queries.join('\n')}
  }`;

const dependency = process.argv[2];

if (!dependency) {
  return console.error(chalk.red('Missing dependency argument. Run node index <dependency>'));
}

fetch('https://api.github.com/graphql', {
  method: 'POST',
  body: JSON.stringify({ query }),
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
}).then(res => res.text())
  .then(body => {
    const data = JSON.parse(body);
    const repositories = [];

    for (var key in data.data) {
      const pkg = JSON.parse(data.data[key].object.text);

      repositories.push({
        name: key,
        prodVersion: pkg.dependencies[dependency] || chalk.red('not found'),
        devVersion: pkg.devDependencies[dependency] || chalk.red('not found')
      });
    }

    repositories.forEach(repo => {
      console.log(`${repo.name}:\n- dependency: ${repo.prodVersion}\n- devDependency: ${repo.devVersion}\n\n`);
    });
  })
  .catch(error => console.error(error));
