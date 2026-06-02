import { JSX } from "hono/jsx";

const isDev = process.env.NODE_ENV !== 'production';

const DEFAULT_META = {
    VIEWPORT: "width=device-width, initial-scale=1",
    CHARSET: "utf-8",
};

/**
 * Properties of the `<Meta>{...}</Meta>` object
 */
export type MetaProperties = {
    title?: string,
    content?: string,
    charSet?: string,
    viewport?: string,
    keywords?: string,
    author?: string,
    locale?: string,
    children?: any,
    bodyStyle?: JSX.HTMLAttributes['style'],
    bodyClass?: JSX.HTMLAttributes['class']
}

/**
 * Reuseable JSX object that will assign metadata to the site for crawlers and add CSS styling. 
 */
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
        bodyStyle,
        bodyClass
    }: MetaProperties
) => {
    return (
        <>
            <html {...(locale ? { lang: locale } : {})}>
                <head>
                    {title && <title>{title}</title>}
                    <meta charSet={charSet ?? DEFAULT_META.CHARSET} />
                    {content && <meta name="description" content={content} />}
                    <meta name="viewport" content={viewport ?? DEFAULT_META.VIEWPORT} />
                    {keywords && <meta name="keywords" content={keywords} />}
                    {author && <meta name="author" content={author} />}
                    <link rel="icon" type="x-icon" href="/../favicon.ico" />
                    <link rel="stylesheet" href="/styles/palette.css" />
                    {isDev && <script type="module" src="/@vite/client" defer />}
                    <script src="/scripts/get-system-theme.js" />
                </head>
                <body class={bodyClass} style={bodyStyle}>{children}</body>
            </html>
        </>
    )
}
