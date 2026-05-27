import { CommonHeader } from "../common/header";
import { Meta } from "../common/meta";
import locales from "../locale";
import { Context } from "hono";
import { GithubSummary, GithubRepositorySummary } from "./api/github-summary";
import { getLang } from "../common/language";

const param = {
    sort: 'sort',
    ordering: 'ordering'
}

type CardItemProperties = {
    repository: GithubRepositorySummary
}

function CardItem(
    { 
        repository 
    }: CardItemProperties
) {
    const language = getLang(repository.language);

    return (
        <div class='card_item'>
            <div class='card_item_header'>
                <a target='_blank' href={language.url}>
                    <img
                        class='card_item_logo'
                        alt={repository.language + ' icon'}
                        src={language.img}
                    />
                </a>
                <a class='card_item_title' target='_blank' href={repository.url}>
                    <span class='card_item_title'>{repository.name}</span>
                </a>
            </div>
            <div class='card_item_description'>
                {repository.description}
            </div>
        </div>
    );
}

type CardListProperties = {
    repositories: GithubRepositorySummary[],
    compare: (a: GithubRepositorySummary, b: GithubRepositorySummary) => number,
}

function CardList(
    {
        repositories,
        compare,
    }: CardListProperties
) {
    const list = repositories.sort(compare);
    return (
        <ul class={'card_list'}>
            {list.map((repository, index) => (
                <li key={index}>
                    <CardItem repository={repository} />
                </li>
            ))}
        </ul>
    );
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

function parseQuery(c: Context) {
    const url = new URL(c.req.url);

    const sortRaw = url.searchParams.get(param.sort);
    const orderRaw = url.searchParams.get(param.ordering);

    const sortKey = sortMap.has(sortRaw ?? '') ? sortRaw! : 'created';
    const orderKey = orderMap.has(orderRaw ?? '') ? orderRaw! : 'ascending';

    const testUrl = new URL(c.req.url);

    testUrl.searchParams.set(param.sort, sortKey);
    testUrl.searchParams.set(param.ordering, orderKey);

    const validQuery = testUrl.toString() === url.toString();

    const sort = sortMap.get(sortKey) ?? defaultSort;
    const direction = orderMap.get(orderKey) ?? 1;
    const compare = (
        a: GithubRepositorySummary, 
        b: GithubRepositorySummary
    ) => direction * sort(a, b);

    return {
        validQuery,
        urlString: testUrl.toString(),
        compare
    };
}

export async function HomePage(c: Context): Promise<Response> {

    const { validQuery, urlString, compare } = parseQuery(c);
    if (!validQuery) {
        return c.redirect(urlString);
    }

    const { locale, msg } = locales.use();

    const summary = await GithubSummary(c);
    if (!summary) return c.jsx(<></>);

    const account = summary.account;
    const repositories = summary.repositories;

    const accountRender = account
        ?   <h2>{account.name}</h2>
        :   <h2>{msg('homepage.noaccount')}</h2>

    const repositoriesRender = repositories
        ?   <CardList 
                repositories={repositories}
                compare={compare}
            />
        :   <p>{msg('homepage.norepositories')}</p>;

    return c.jsx(
        <Meta
            title={msg('homepage.title')}
            content={msg('homepage.content')}
            locale={locale}
            bodyClass='body'
        >
            <CommonHeader />
            {accountRender}
            {repositoriesRender}
        </Meta>
    );
}