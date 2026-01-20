import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'; // Default to main if not specified

if (!GITHUB_TOKEN) {
    console.warn('⚠️ GITHUB_TOKEN is missing from .env. GitHub storage features will fail.');
}

console.log(`GitHub Config: Repo=${GITHUB_OWNER}/${GITHUB_REPO}, Branch=${GITHUB_BRANCH}`);


export const octokit = new Octokit({
    auth: GITHUB_TOKEN,
    userAgent: 'OpenLearn-Hub-Backend/1.0.0'
});

export const githubConfig = {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH
};
