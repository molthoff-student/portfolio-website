import locale from "../locale";

const exampleLogo = "../assets/placeholder.png";

export const linkStyle = {    
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
    fontW: 'bold',
}

const imageStyle = {
    width: '32px', 
    height: '32px'
}

export function CommonHeader() {
    const { msg } = locale.use();
    const logoText = msg('header.logotext');

    const textStyle = { color: 'var(--text)' };
    return (
        <>
            <header class="header">
                <a className="title" href="/" style={linkStyle}>
                    <img
                        className="title" 
                        alt="Example logo" 
                        src={exampleLogo}
                        style={imageStyle}
                    />
                    <span style={textStyle}>{logoText}</span>
                </a>
            </header>
        </>
    );
}