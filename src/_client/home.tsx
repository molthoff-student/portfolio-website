import { useEffect, useMemo, useState } from 'hono/jsx';
import { fetchGithubSummary, GithubAccountSummary, GithubRepositorySummary, GithubSummary } from '../_server/api/github-summary'
import { mount } from '../utility/client'
import { getLang } from '../utility/language';
import { Header } from '../components/header';
import { orderMap, parseRepositoryQuery, sortMap } from '../components/queries/repositories';
import { TranslationProvider, useTranslation } from '../locale';

export type HomeProps = {
    locale: string,
}

function Home(
    {
        locale
    }: HomeProps
) {

    const [summary, setSummary] = useState<GithubSummary | null>(null);

    useEffect(() => {
        async function getSummary() {
            const origin = window.location.origin;
            const summary = await fetchGithubSummary(origin);
            setSummary(summary);
        }

        getSummary();
    }, [origin]);

    const account = summary?.account ?? null;
    const repositories = summary?.repositories ?? null;

    return (
        <>
            <TranslationProvider locale={locale}>
                <>
                    <Header />
                    <div class='homepage_layout'>
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
                    </div>
                </>
            </TranslationProvider>
        </>
    );
}

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
}
function RepoList({ repositories }: RepoListProperties) {
    const { locale, msg } = useTranslation();

    const [query, setQuery] = useState(() =>
        parseRepositoryQuery(window.location.href)
    );

    useEffect(
        () => {
            const onPopState = () => {
                setQuery(parseRepositoryQuery(window.location.href));
            };

            window.addEventListener('popstate', onPopState);
            return () => window.removeEventListener('popstate', onPopState);
        }, 
        []
    );

    const updateQuery = (key: string, value: string) => {

        setQuery(prev => {
            const nextSort = key === 'sort' ? value : prev.sortKey;
            const nextOrder = key === 'ordering' ? value : prev.orderKey;

            const params = new URLSearchParams();
            params.set('sort', nextSort);
            params.set('ordering', nextOrder);

            const nextUrl = window.location.origin 
                + window.location.pathname
                + '?'
                + params.toString();

            const parsed = parseRepositoryQuery(nextUrl);

            
            window.history.pushState({}, '', parsed.urlString);

            return parsed;
        });
    };

    const sortedRepositories = useMemo(() => {
        const sort = sortMap.get(query.sortKey)!;
        const direction = orderMap.get(query.orderKey)!;
        return [...repositories].sort((a, b) => direction * sort(a, b));
    }, [repositories, query]);

    return (
        <>
            <div style={{justifyContent: "right", display: "flex", marginRight: 10, marginTop: 10}}>
                <select
                    class='smallSelector'
                    value={query.sortKey}
                    onChange={(e) => {
                        const target = e.target as HTMLSelectElement;
                        updateQuery('sort', target.value);
                    }}
                >
                    {Array.from(sortMap.keys()).map((key) => {
                        return <option value={key}>{msg(`sort.${key}`)}</option>;
                    })}
                </select>
                <button
                    type='button'
                    class='smallSelector'
                    onClick={() =>
                        updateQuery(
                            'ordering',
                            query.orderKey === 'ascending'
                                ? 'descending'
                                : 'ascending'
                        )
                    }
                >
                    {query.orderKey === 'ascending' ? '∧' : '∨'}
                </button>
            </div>
            <ul className='repository_container'>
                {sortedRepositories.map((repository) => (
                    <li key={repository.name}>
                        <RepoItem repository={repository} />
                    </li>
                ))}
            </ul>
        </>
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

mount(document, Home);