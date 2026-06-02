import { Context } from "hono";
import { GithubAccount } from "./github-account";
import { GithubRepo } from "./github-repositories";

const GithubSummaryUrl = '/api/summary';

export async function fetchGithubSummary(origin: string): Promise<GithubSummary | null> {
    const url = origin + GithubSummaryUrl;
    console.log(`url: ${url}`);
    return await fetch(url)
        .then(res => res.json())
        .catch(_ => null) as GithubSummary | null;
}

// Fetcher function
export async function GithubSummary(c: Context): Promise<GithubSummary | null> {
    const account = await GithubAccount(c);
    const repositories = await GithubRepo(c);

    if (account && repositories) {
        return {
            account: {
                name: account.name,
                user: account.login,
                url: account.html_url,
                bio: account.bio,
                img: account.avatar_url,
                created_at: account.created_at
            },
            repositories: repositories
                .map(repo => ({
                    name: repo.name,
                    url: repo.html_url,
                    description: repo.description,
                    language: repo.language,
                    created_at: repo.created_at,
                    updated_at: repo.updated_at,
                    pushed_at: repo.pushed_at,
                } as GithubRepositorySummary))
                .sort((a, b) => {
                    const ad = new Date(b.created_at);
                    const bd = new Date(a.created_at);
                    return ad.getTime() - bd.getTime();
                })
        }
    }

    return null;
}

// Api page
export async function GithubSummaryPage(c: Context): Promise<Response> {
    const data = await GithubSummary(c);
    return c.json(data);
}

export interface GithubAccountSummary {
    name: string | null,
    user: string,
    url: string,
    bio: string | null,
    img: string,
    created_at: string
}

export interface GithubRepositorySummary {
    name: string,
    url: string,
    description: string | null,
    language: string | null,
    created_at: string,
    updated_at: string,
    pushed_at: string,
}

export interface GithubSummary {
    account: GithubAccountSummary | null,
    repositories: GithubRepositorySummary[] | null
}