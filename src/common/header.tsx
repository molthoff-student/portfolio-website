import locale from '../locale';

const logo = '../assets/logo.png';

export const linkStyle = {    
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    fontW: 'bold',
}

export function CommonHeader() {
    const { msg } = locale.use();
    const logoText = msg('header.logotext');

    const textStyle = { color: 'var(--text)' };
    return (
        <>
            <header class='header'>
                <a class='link' href='/'>
                    <img
                        class='logo'
                        alt='Example logo' 
                        src={logo}
                    />
                    <span class='span'>{logoText}</span>
                </a>
            </header>
        </>
    );
}