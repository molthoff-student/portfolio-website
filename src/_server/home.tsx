import { Header } from "../components/header";
import { Meta } from "../utility/meta";
import { Context } from "hono";
import { GithubSummary, GithubRepositorySummary } from "./api/github-summary";
import useLocale from "../useLocale";
import { Render } from "../utility/client";
import { HomeProps } from "../_client/home";

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

export async function HomePage(c: Context): Promise<Response> {

    const { validQuery, urlString, compare } = parseQuery(c);
    if (!validQuery) {
        return c.redirect(urlString);
    }

    const { locale, msg } = useLocale();

    return c.render(
        <Meta
            title={msg('homepage.title')}
            content={msg('homepage.content')}
            locale={locale}
            bodyClass='body'
        >
            <Header locale={locale} />
            <Render<HomeProps> 
                path='src/_client/home.tsx' 
                data={{
                    locale,
                }}
                attributes={{
                    class: 'homepage_layout'
                }}
            />
        </Meta>
    );
}