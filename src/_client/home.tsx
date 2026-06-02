import { useEffect, useState } from "hono/jsx";
import { fetchGithubSummary, GithubAccountSummary, GithubRepositorySummary, GithubSummary } from "../_server/api/github-summary"
import { mount } from "../utility/client"
import { getLang } from "../utility/language";

export type HomeProps = {
    locale: string,
}

function Home(
    {
        locale,
    }: HomeProps
) {
    const origin = window.location.origin;

    const [summary, setSummary] = useState<GithubSummary | null>(null);

    useEffect(() => {
        async function load() {
            const summary = await fetchGithubSummary(origin);
            setSummary(summary);
        }

        load();
    }, []);

    const account = summary?.account || null;
    const repositories = summary?.repositories || null;

    return (
        <>
            <aside class='profile_content'>
                {account
                    ?   <Account
                            account={account}
                        />
                    :   <></>
                }
            </aside>
            <main>
                {repositories
                    ?   <RepoList 
                            repositories={repositories}
                        />
                    :   <></>
                }
            </main>
        </>
    );
}

mount(document, Home);

type RepoItemProperties = {
    repository: GithubRepositorySummary
}

function RepoItem(
    { 
        repository 
    }: RepoItemProperties
) {
    const language = getLang(repository.language);

    return (
        <div class='repository_item'>
            <div class='repository_item_header'>
                <a target='_blank' href={language.url}>
                    <img
                        class='repository_item_logo'
                        alt={repository.language + ' icon'}
                        src={language.img}
                    />
                </a>
                <a class='repository_item_title' target='_blank' href={repository.url}>
                    <span class='repository_item_title'>{repository.name}</span>
                </a>
            </div>
            <div class='repository_item_description'>
                {repository.description}
            </div>
        </div>
    );
}

type RepoListProperties = {
    repositories: GithubRepositorySummary[],
    // compare: (a: GithubRepositorySummary, b: GithubRepositorySummary) => number,
}

function RepoList(
    {
        repositories,
        // compare,
    }: RepoListProperties
) {
    // const list = repositories.sort(compare);
    return (
        <ul class={'repository_container'}>
            {repositories.map((repository, index) => (
                <li key={index}>
                    <RepoItem repository={repository} />
                </li>
            ))}
        </ul>
    );
}

type AccountProperties = {
    account: GithubAccountSummary
}

function Account(
    {
        account
    }: AccountProperties
) {

    const profileName = account.name 
        ? account.name + ' | ' + account.user
        : account.user

    return (
        <>
            <a class='link' target='_blank' href={account.url}>
                <img
                    src={account.img}
                    class='profile_image'
                />
            </a>
            <hr />
            <h1 class='profile_text'>{profileName}</h1>
            <p class='profile_text'>{account.bio ?? ''}</p>
        </>
    );
}