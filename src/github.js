import jwt from "jsonwebtoken";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

function generateJWT() {
  const privateKey = fs.readFileSync(
    process.env.GITHUB_PRIVATE_KEY_PATH,
    "utf8",
  );
  const payload = {
    iat: Math.floor(Date.now() / 1000) - 60,
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
    iss: process.env.GITHUB_APP_ID,
  };
  return jwt.sign(payload, privateKey, { algorithm: "RS256" });
}

export async function getInstallationToken(installationId) {
  const appJwt = generateJWT();
  const response = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${appJwt}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
  return response.data.token;
}

export async function getPullRequestDiff(owner, repo, pullNumber, token) {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.diff",
      },
    },
  );
  return response.data;
}

export async function postComment(owner, repo, pullNumber, body, token) {
  await axios.post(
    `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
    { body },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
}
