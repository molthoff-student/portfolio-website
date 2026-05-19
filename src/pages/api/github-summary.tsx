import { Context } from "hono";
import { GithubAccount } from "./github-account";
import { GithubRepo } from "./github-repositories";

const DURATION: number = 60_000;

// Fetcher function
export async function GithubSummary(c: Context): Promise<GithubSummary | null> {
    const account = await GithubAccount(c);
    const repositories = await GithubRepo(c);

    if (account && repositories) {
        return {
            account: {
                name: account.login,
                url: account.html_url,
                bio: account.bio,
                created_at: account.created_at
            },
            repositories: repositories.map(repo => ({
                name: repo.name,
                url: repo.html_url,
                description: repo.description,
                created_at: repo.created_at
            }))
        }
    }

    return null;
}

// Api page
export async function GithubSummaryPage(c: Context): Promise<Response> {
    const data = await GithubSummary(c);
    return c.json(data);
}

export interface GithubSummary {
    account: {
        name: string,
        url: string,
        bio: string | null
        created_at: string
    },
    repositories: {
        name: string,
        url: string,
        description: string | null
        created_at: string
    }[]
}