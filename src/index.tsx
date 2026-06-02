import { Context, Hono } from 'hono'
import locales from './locale'
import { contextStorage } from 'hono/context-storage';
import { HomePage } from './_server/home';
import { GithubAccountPage } from './_server/api/github-account';
import { GithubRepoPage } from './_server/api/github-repositories';
import { GithubSummaryPage } from './_server/api/github-summary';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { AboutPage } from './_server/about';
import { jsxRenderer } from 'hono/jsx-renderer';

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

index.use(
    '*', 
    jsxRenderer(
        ({ children }) => {
            return (<>{children}</>);
        },
        {
            docType: '<!DOCTYPE html>'
        }
    )

)

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

// type PageResponse = ((c: Context) => Response) | ((c: Context) => Promise<Response>);
type PageResponse = (c: Context) => Response | Promise<Response>
type Page = {
    url: string,
    response: PageResponse,
}

const pages: Page[] = [
    { url: '/:locale', response: HomePage },
    { url: '/:locale/about', response: AboutPage },
    { url: '/api/github', response: GithubAccountPage },
    { url: '/api/repositories', response: GithubRepoPage },
    { url: '/api/summary', response: GithubSummaryPage },
];

pages.forEach(page => {
    index.get(page.url, page.response)
});

export default index;