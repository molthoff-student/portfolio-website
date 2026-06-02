import locales from '../locale';

const logo = '../assets/logo.png';

export type HeaderProps = {
    locale: string
}

export function Header(
    {
        locale
    }: HeaderProps
) {
    const t = locales.get(locale);
    const logoText = t.msg('header.logotext');

    return (
        <>
            <header class='header'>
                <div>
                    <a class='link' href={`/${t.locale}`}>
                        <img
                            class='logo'
                            alt='Example logo' 
                            src={logo}
                        />
                        <span class='span'>{logoText}</span>
                    </a>
                </div>
            </header>
        </>
    );
}