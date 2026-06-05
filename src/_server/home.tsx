import { Meta } from "../utility/meta";
import { Context } from "hono";
import { GithubRepositorySummary } from "./api/github-summary";
import useLocale from "../useLocale";
import { Render } from "../utility/client";
import { HomeProps } from "../_client/home";
import { orderMap, parseRepositoryQuery, sortMap } from "../components/queries/repositories";

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

    return {
        validQuery,
        urlString,
        sortKey,
        orderKey
    };
}

export async function HomePage(c: Context): Promise<Response> {
    
    const { 
        validQuery, 
        urlString 
    } = parseRepositoryQuery(c.req.url);

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
            <Render<HomeProps>
                path='src/_client/home.tsx' 
                data={{
                    locale
                }}
            />
        </Meta>
    );
}