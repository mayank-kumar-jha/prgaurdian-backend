async function getPRFiles(octokit, owner, repo, prNumber) {
    const { data } = await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
    });

    return data.map((file) => ({
        filename: file.filename,
        status: file.status,
        patch: file.patch,
    }));
}

module.exports = { getPRFiles };