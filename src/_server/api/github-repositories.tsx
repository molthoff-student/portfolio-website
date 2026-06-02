import { Context } from "hono";
import { GithubAccount } from "./github-account";
import { API_INIT, API_UPDATE_DURATION } from "../api";

const GIT_KEY: string = "GithubRepository";

// Fetcher function
export async function GithubRepo(c: Context): Promise<GitHubRepository[] | null> {
    const kv: KVNamespace = c.env.KVData;

    const cached = await kv.get(GIT_KEY, 'json') as {
        data: GitHubRepository[]
        timestamp: number
    } | null;

    const now = Date.now();

    if (cached && now - cached.timestamp < API_UPDATE_DURATION) {
        return cached.data;
    }

    const githubAccount = await GithubAccount(c);
    if (!githubAccount) return null;

    const api_url = githubAccount.repos_url

    const data = await fetch(api_url, API_INIT)
        .then(res => res.json())
        .catch(_ => null) as GitHubRepository[] | null;

    if (data) {
        const json = JSON.stringify({ data, timestamp: now });
        await kv.put(GIT_KEY, json);
        return [...data]
    }

    return cached ? [...cached.data] : null;
}

// Api page
export async function GithubRepoPage(c: Context): Promise<Response> {
    const data = await GithubRepo(c);
    return c.json(data);
}

// Grabbed from Github Api documentation.
export interface GitHubRepository {
    id: number
    node_id: string

    name: string
    full_name: string
    private: boolean

    owner: {
        login: string
        id: number
        node_id: string
        avatar_url: string
        html_url: string
        type: 'User' | 'Organization'
        site_admin: boolean
    }

    html_url: string
    description: string | null
    fork: boolean

    url: string
    forks_url: string
    keys_url: string
    collaborators_url: string
    teams_url: string
    hooks_url: string
    issue_events_url: string
    events_url: string
    assignees_url: string
    branches_url: string
    tags_url: string
    blobs_url: string
    git_tags_url: string
    git_refs_url: string
    trees_url: string
    statuses_url: string
    languages_url: string
    stargazers_url: string
    contributors_url: string
    subscribers_url: string
    subscription_url: string
    commits_url: string
    git_commits_url: string
    comments_url: string
    issue_comment_url: string
    contents_url: string
    compare_url: string
    merges_url: string
    archive_url: string
    downloads_url: string
    issues_url: string
    pulls_url: string
    milestones_url: string
    notifications_url: string
    labels_url: string
    releases_url: string
    deployments_url: string

    created_at: string
    updated_at: string
    pushed_at: string

    git_url: string
    ssh_url: string
    clone_url: string
    svn_url: string

    homepage: string | null
    size: number

    stargazers_count: number
    watchers_count: number

    language: string | null

    has_issues: boolean
    has_projects: boolean
    has_downloads: boolean
    has_wiki: boolean
    has_pages: boolean
    has_discussions: boolean

    forks_count: number

    archived: boolean
    disabled: boolean

    open_issues_count: number

    allow_forking: boolean
    is_template: boolean
    web_commit_signoff_required: boolean

    visibility: 'public' | 'private' | 'internal'

    forks: number
    open_issues: number
    watchers: number

    default_branch: string
}