import express, { json } from "express";
import {
  getInstallationToken,
  getPullRequestDiff,
  postComment,
} from "./github.js";
import { reviewDiff } from "./llm.js";
import { formatReviewAsMarkdown } from "./format.js";

const app = express();
app.use(json());

app.post("/webhook", async (req, res) => {
  const event = req.headers["x-github-event"];
  const body = req.body;

  if (
    event === "pull_request" &&
    (body.action === "opened" || body.action === "synchronize")
  ) {
    const installationId = body.installation.id;
    const owner = body.repository.owner.login;
    const repo = body.repository.name;
    const pullNumber = body.number;

    try {
      const token = await getInstallationToken(installationId);
      const diff = await getPullRequestDiff(owner, repo, pullNumber, token);
      const review = await reviewDiff(diff);
      const markdown = formatReviewAsMarkdown(review);
      await postComment(owner, repo, pullNumber, markdown, token);
      console.log("Comment posted successfully");
    } catch (err) {
      console.error("Pipeline failed:", err.response?.data || err.message);
    }
  }

  res.status(200).send("ok");
});

app.listen(3000, () => console.log("Listening on port 3000"));
