import { Header } from "../components/header";
import { Meta } from "../utility/meta";
import locales from "../locale";
import { Context } from "hono";
import { GithubSummary, GithubRepositorySummary, GithubAccountSummary } from "./api/github-summary";
import { getLang } from "../utility/language";
import { useState } from "hono/jsx";
import useLocale from "../useLocale";

const param = {
    sort: 'sort',
    ordering: 'ordering'
}

const parseQuery = (c: Context) => {
    const url = new URL(c.req.url);

    const sortRaw = url.searchParams.get(param.sort);
    const orderRaw = url.searchParams.get(param.ordering);

    const sortKey = sortMap.has(sortRaw ?? '') ? sortRaw! : 'created';
    const orderKey = orderMap.has(orderRaw ?? '') ? orderRaw! : 'ascending';

    const testUrl = new URL(c.req.url);

    testUrl.searchParams.set(param.sort, sortKey);
    testUrl.searchParams.set(param.ordering, orderKey);

    const urlString = testUrl.toString();
    const validQuery = urlString === url.toString();

    const sort = sortMap.get(sortKey) ?? defaultSort;
    const direction = orderMap.get(orderKey) ?? 1;
    const compare = (
        a: GithubRepositorySummary, 
        b: GithubRepositorySummary
    ) => direction * sort(a, b);

    console.log(`sortKey: ${sortKey}\norderKey: ${orderKey}`);
    return {
        validQuery,
        urlString,
        compare,
        sortKey,
        orderKey
    };
}

const dateSort = (
    key: 'created_at' | 'updated_at' | 'pushed_at'
) => (
    a: GithubRepositorySummary,
    b: GithubRepositorySummary
): number => {
    return (
        new Date(b[key]).getTime() -
        new Date(a[key]).getTime()
    );
};

const defaultSort = dateSort('created_at');

const sortMap = new Map([
    ['created', dateSort('updated_at')],
    ['updated', dateSort('created_at')],
    ['pushed',  dateSort('pushed_at')]
]);

const orderMap = new Map([
    ['ascending',   1],
    ['descending', -1],
]);

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

function TestButton(
    { category }: { category: string}
) {
    // const jsScript = `
    //     document.querySelector('#sort select').addEventListener('change', (e) => e.target.form.submit())
    // `;

    const [state, setState] = useState(true);

    const options = sortMap.keys().toArray().map(
        (key) => {
            return <option selected={key === category} value={key}>{key}</option>;
        }
    );

    console.log(`TestButton::category: ${category}`);

    const selectId = "sortSelect";

    return (
        <>
            <button onClick={() => setState(!state)}>{`state: ${state}`}</button>
            <select id={selectId}>
                {options}
            </select>

            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        const select = document.getElementById('${selectId}');

                        select.addEventListener('change', () => {
                            const url = new URL(window.location.href);
                            url.searchParams.set('${param.sort}', select.value);
                            window.location.href = url.toString();
                        });
                    `,
                }}
            />
        </>
    );

}

export async function HomePage(c: Context): Promise<Response> {

    const { validQuery, urlString, compare, sortKey, orderKey } = parseQuery(c);
    if (!validQuery) {
        return c.redirect(urlString);
    }

    const { locale, msg } = useLocale();

    const summary = await GithubSummary(c);
    if (!summary) return c.render(
        <>
        </>
    );

    const account = summary.account;
    const repositories = summary.repositories;
    const noAccount = <h2>{msg('homepage.noaccount')}</h2>;
    const noRepositories = <p>{msg('homepage.norepositories')}</p>;

    console.log(`HomePage::sortKey: ${sortKey}`);

    return c.render(
        <Meta
            title={msg('homepage.title')}
            content={msg('homepage.content')}
            locale={locale}
            bodyClass='body'
        >
            <Header locale={locale} />
            <div class='homepage_layout'>
                <aside class='profile_content'>
                    {account
                        ?   <Account
                                account={account}
                            />
                        :   noAccount
                    }
                </aside>
                <main>
                    <TestButton category={sortKey} />
                    {repositories
                        ?   <RepoList 
                                repositories={repositories.sort(compare)}
                            />
                        :   noRepositories
                    }
                </main>
            </div>
        </Meta>
    );
}