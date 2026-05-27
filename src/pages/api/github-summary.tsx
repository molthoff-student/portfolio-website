import { Context } from "hono";
import { GithubAccount } from "./github-account";
import { GithubRepo } from "./github-repositories";

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
    account: {
        name: string,
        url: string,
        bio: string | null
        created_at: string
    },
    repositories: GithubRepositorySummary[] | null
}