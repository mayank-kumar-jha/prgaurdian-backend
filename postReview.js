async function postReview(octokit, owner, repo, prNumber, commitSha, allComments, overallVerdict, summaryBody) {
    const eventMap = {
        approve: 'APPROVE',
        request_changes: 'REQUEST_CHANGES',
        comment: 'COMMENT',
    };

    await octokit.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        commit_id: commitSha,
        event: eventMap[overallVerdict] || 'COMMENT',
        body: summaryBody || '',
        comments: allComments,
    });
}

module.exports = { postReview };