import { Context, Hono } from 'hono'
import locales from './locale'
import { JSX } from 'hono/jsx/jsx-runtime'
import { contextStorage } from 'hono/context-storage';
import { renderToString } from 'hono/jsx/dom/server';
import { HomePage } from './pages/homepage';
import { GithubAccountPage } from './pages/api/github-account';
import { GithubRepoPage } from './pages/api/github-repositories';
import { GithubSummaryPage } from './pages/api/github-summary';
import { trimTrailingSlash } from 'hono/trailing-slash';

// Add wrapper for jsx to the Context object.
declare module 'hono' {
    interface Context {
        jsx: (jsx: JSX.Element) => Response
    }
}

export type Env = {
    Variables: {
        locale: string,
    }
    KVData: KVNamespace
}

const index = new Hono<Env>();

// Import to remove trailing slashes from url's automatically.
index.use(trimTrailingSlash());

// Adds contextStorage middleware for storing and accessing the context.
index.use(contextStorage());

// Implement jsx wrapper.
index.use('*', async (c, next) => {
    c.jsx = (jsx: JSX.Element) => {
        const pageData = renderToString(jsx);
        return c.html(`<!DOCTYPE html>\n${pageData}`)
    }

    await next()
});

// Implement locale slug.
index.use('/:locale/*', async (c, next) => {
    const locale = c.req.param('locale');

    if (locales.has(locale)) {
        c.set('locale', locale);
    }

    await next()
})

// Try to fetch the user's locale.
index.get('/', (c) => {
    const language = c.req.header('accept-language');

    if (language) {
        console.log(`comparing locale: '${language}'`);
        for (const key in locales.keys()) {
            console.log(`comparing against '${key}'`);
            if (language.startsWith(key)) {
                return c.redirect(`/${key}`)
            }
        }
    }

    return c.redirect(locales.default())
});

type PageResponse = ((c: Context) => Response) | ((c: Context) => Promise<Response>);
type Page = {
    url: string,
    response: PageResponse,
}

const pages: Page[] = [
    { url: '/:locale', response: HomePage },
    { url: '/api/github', response: GithubAccountPage },
    { url: '/api/repositories', response: GithubRepoPage },
    { url: '/api/summary', response: GithubSummaryPage },
];

pages.forEach(page => {
    index.get(page.url, page.response)
});

export default index;