const slugify = require('slugify');

module.exports = function (repo) {
  const slug = slugify(repo, { remove: /[$*_\-+~.()'"!\-:@]/g });

  return `${slug}: repository(name: "${repo}", owner: "${process.env.OWNER}") {
        object(expression: "master:package.json") {
          ... on Blob {
            text
          }
        }
      }`;
};
