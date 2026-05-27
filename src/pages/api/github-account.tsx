import { Context } from "hono";
import { API_INIT, API_UPDATE_DURATION } from "../api";

const API_URL: string = "https://api.github.com/users/molthoff-student";
const GIT_KEY: string = "GithubAccount";

// Fetcher function
export async function GithubAccount(c: Context): Promise<GitHubUser | null> {
    const kv = c.env.KVData;

    const cached = await kv.get(GIT_KEY, 'json') as null | {
        data: GitHubUser
        timestamp: number
    };

    const now = Date.now();

    if (cached && now - cached.timestamp < API_UPDATE_DURATION) {
        return cached.data;
    }

    // Ignore the error if there is one, the server most likely lost connection.
    const data = await fetch(API_URL, API_INIT)
        .then(res => res.json())
        .catch(_ => null) as GitHubUser | null;

    if (data) {
        const json = JSON.stringify({ data, timestamp: now });
        await kv.put(GIT_KEY, json);
        return data
    }

    return cached ? cached.data : null;
}

// Api page
export async function GithubAccountPage(c: Context): Promise<Response> {
    const data = await GithubAccount(c);
    return c.json(data);
}

// Grabbed from Github Api documentation.
export interface GitHubUser {
    login: string
    id: number
    node_id: string

    avatar_url: string
    gravatar_id: string | null

    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string

    type: 'User' | 'Organization'
    site_admin: boolean

    name: string | null
    company: string | null
    blog: string | null
    location: string | null
    email: string | null
    hireable: boolean | null
    bio: string | null
    twitter_username: string | null

    public_repos: number
    public_gists: number
    followers: number
    following: number

    created_at: string
    updated_at: string
};