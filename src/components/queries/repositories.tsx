import { GithubRepositorySummary } from "../../_server/api/github-summary";

const param = {
    sort: 'sort',
    ordering: 'ordering'
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

export const defaultSort = dateSort('created_at');

export const sortMap = new Map([
    ['created', dateSort('created_at')],
    ['updated', dateSort('updated_at')],
    ['pushed',  dateSort('pushed_at')]
]);

export const orderMap = new Map([
    ['ascending',   1],
    ['descending', -1],
]);

export const parseRepositoryQuery = (
    url: string,
) => {

    const parsedUrl = new URL(url);
    const params = parsedUrl.searchParams;

    const sortRaw = params.get("sort");
    const orderRaw = params.get("ordering");

    const sortKey = sortRaw && sortMap.has(sortRaw) ? sortRaw : 'created';

    const orderKey = orderRaw && orderMap.has(orderRaw) ? orderRaw : 'ascending';

    console.log("sortRaw:", sortRaw, "valid:", sortMap.has(sortRaw ?? ''));

    const testUrl = new URL(url);

    testUrl.searchParams.set(param.sort, sortKey);
    testUrl.searchParams.set(param.ordering, orderKey);

    const urlString = testUrl.toString();
    const validQuery = urlString === url;

    return {
        validQuery,
        urlString,
        sortKey,
        orderKey
    };
}