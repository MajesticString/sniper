const { writeFile, readFile } = require('fs/promises');
const { fetch } = require('undici');

/**
 * Delay for a number of milliseconds
 */
function sleep(delay) {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}
const main = async () => {
  let stuffToAppend = '';
  await fetch(
    'https://api.github.com/repos/MajesticString/sniper/commits?per_page=50'
  ).then(async (res) => {
    /**
     * @type {import('./types.js').CommitRes[]}
     */
    const json = await res.json();
    json.forEach(async (cmt) => {
      stuffToAppend += `
## ${new Date(cmt.commit.committer.date).toLocaleString()}

### Message

${cmt.commit.message}

### Commit Info

- Author: ${cmt.commit.author.name}
- Comment Count: ${cmt.commit.comment_count}

[Commit Link](${cmt.html_url})${
        // <details>
        //  <summary>View Diff</summary>
        //  ${await (await fetch(cmt.html_url + '.diff')).text()}
        //</details>
        ''
      }
`;
    });
    await writeFile(
      './docs/changelog.md',
      (await readFile('./changelog-docs-template.md')) + stuffToAppend
    );
  });
};

sleep(2000);
main();
sleep(2000);
