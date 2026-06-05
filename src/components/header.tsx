import locales, { useTranslation } from '../locale';
import { userthemes, useTheme } from '../utility/usertheme';
import site_information from '../assets/site-information.json';
import { useEffect, useState } from 'hono/jsx';

const GITHUB_URL = site_information.website_people.developer.socials.github;
const logo = '../assets/logo.png';

function mediaQuery(query: string) {
    const [matches, setMatches] = useState(() =>
        window.matchMedia(query).matches
    );

    useEffect(() => {
        const media = window.matchMedia(query);

        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

        media.addEventListener("change", handler);

        return () => media.removeEventListener("change", handler);
    }, [query]);

    return matches;
}

export type HeaderProps = {
    locale: string
}

export function Header() {
    const { locale, msg } = useTranslation();

    const [theme, setTheme] = useTheme();
    const [burgerState, setBurgerState] = useState(false);

    const isMobile = mediaQuery('(max-width: 768px)');

    const open = isMobile ? burgerState : false;

    const homeUrl = `/${locale}`;

    const navs = [
        { name: msg('nav.github'), link: GITHUB_URL },
        { name: msg('nav.about'), link: homeUrl + '/about' },
        { name: msg('nav.blog'), link: homeUrl + '/blog' },
    ];

    const logoText = msg('header.logotext');
    const logoSelect = isMobile
        ?   <select 
                class='span' 
                value={logoText}
                name='logoSelect'
                onChange={(e) => {
                    const target = e.currentTarget as HTMLSelectElement;
                    window.location.href = target.value;
                }}
            >
                <option value={homeUrl}>{logoText}</option>
                {navs.map(item => {
                    return <option value={item.link}>{item.name}</option>;
                })}
            </select>
        :   <span class='span'>{logoText}</span>;

    const navbar = (
        isMobile 
        ?   <></>
        :   <nav class='nav'>
                {
                    navs.map(item => {
                        return (
                            <a class='link' href={item.link}>
                                <span class='span'>{item.name}</span>
                            </a>
                        );
                    })
                }
            </nav>
    );

    const localeSelect = (
        <select 
            class='span' 
            value={locale}
            name='localeSelect'
            onChange={(e) => {
                const target = e.currentTarget as HTMLSelectElement;
                console.log(`value: ${target.value}\npathname: ${window.location.pathname}`);
                if (target.value !== window.location.pathname) {
                    window.location.href = `${window.location.origin}/${target.value}`;
                }
            }}
        >
            {locales.keys().map(lang => {
                return <option value={lang}>{lang}</option>;
            })}
        </select>
    );

    const themeSelect = (
        <select 
            class='span' 
            value={theme} 
            name='themeSelect'
            onChange={(e) => {
                const target = e.currentTarget as HTMLSelectElement;
                setTheme(target.value);
            }}
        >
            {userthemes.map(userTheme => {
                return <option value={userTheme}>{msg(`theme.${userTheme}`)}</option>;
            })}
        </select>
    );

    return (
        <>
            <header class='header'>
                <div class='logoselect'>
                    <a class='link' href={homeUrl}>
                        <img
                            class='logo'
                            alt='Example logo'
                            src={logo}
                        />
                    </a>
                    {isMobile
                        ?   logoSelect 
                        :   <a 
                                class='link' 
                                href={homeUrl}
                            >
                                {logoSelect}
                            </a>
                    }
                </div>
                {isMobile
                    ?   <button className="burger" onClick={() => setBurgerState(!burgerState)}>
                            ☰
                        </button>
                    :   <div class='menu'>
                            {navbar}
                            {localeSelect}
                            {themeSelect}
                        </div>
                }

            </header>
            {open &&
                <div class='header subheader'>
                    {localeSelect}
                    {themeSelect}
                </div>
            }
        </>
    );
}