import { CommonHeader } from "../common/header";
import { Meta } from "../common/meta";
import locales from "../locale";
import { Context } from "hono";
import { GithubRepo } from "./api/github-repositories";
import { GithubAccount } from "./api/github-account";

const linkStyle = {    
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    fontW: 'bold',
}

export async function HomePage(c: Context) {
    const { locale, msg } = locales.use();

    const pageStyle = {
        padding: '0px',
        margin: '0px',
        background: 'var(--background)',
        color: 'var(--text)'
    }

    const account = await GithubAccount(c);
    const repositories = await GithubRepo(c);
    
    const accountRender = account
        ?   <p>{account.login}</p>
        :   <p>{msg('')}</p>

    const repositoriesRender = repositories
        ?   <ul>
                {repositories!.map(repo => (
                    <a style={linkStyle} href={repo.html_url}>
                        <li key={repo.id || repo.full_name}>
                            {repo.name}
                        </li>
                    </a>
                ))}
            </ul>
        :   <p>{msg('homepage.norepositories')}</p>;


    return c.jsx(
        <Meta
            title={msg('homepage.title')}
            content={msg('homepage.content')}
            locale={locale}
            style={pageStyle}
        >
            <CommonHeader />
            <p>{msg('homepage.content')}</p>
            {accountRender}
            {repositoriesRender}
        </Meta>
    );
}