import { JSX } from "hono/jsx";

const isDev = process.env.NODE_ENV !== 'production';

const DEFAULT = {
    VIEWPORT: "width=device-width, initial-scale=1",
    CHRSET: "utf-8",
};

export type MetaProperties = {
    title?: string,
    content?: string,
    charSet?: string,
    viewport?: string,
    keywords?: string,
    author?: string,
    locale?: string,
    children?: any,
    style?: JSX.HTMLAttributes['style']
}

export const Meta = (
    { 
        title, 
        content,
        charSet,
        viewport,
        keywords,
        author,
        locale,
        children,
        style,
    }: MetaProperties
) => {
    return (
        <>
            <html {...(locale ? { lang: locale } : {})}>
                <head>
                    {title && <title>{title}</title>}
                    <meta charSet={charSet ?? DEFAULT.CHRSET} />
                    {content && <meta name="description" content={content} />}
                    <meta name="viewport" content={viewport ?? DEFAULT.VIEWPORT} />
                    {keywords && <meta name="keywords" content={keywords} />}
                    {author && <meta name="author" content={author} />}
                    {isDev && <script type="module" src="/@vite/client" defer />}
                    {/* <link href={isDev ? '/src/style.css' : '/assets/style.css'} rel="stylesheet" /> */}
                    <link rel="stylesheet" href="../styles/palette.css" />
                </head>
                <script src="../scripts/get-system-theme.js" />
                <body style={style}>{children}</body>
            </html>
        </>
    )
}
