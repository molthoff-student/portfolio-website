import { JSX } from "hono/jsx";

const isDev = process.env.NODE_ENV !== 'production';

const DEFAULT_META = {
    VIEWPORT: "width=device-width, initial-scale=1",
    CHRSET: "utf-8",
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
    style?: JSX.HTMLAttributes['style']
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
        style,
    }: MetaProperties
) => {
    return (
        <>
            <html {...(locale ? { lang: locale } : {})}>
                <head>
                    {title && <title>{title}</title>}
                    <meta charSet={charSet ?? DEFAULT_META.CHRSET} />
                    {content && <meta name="description" content={content} />}
                    <meta name="viewport" content={viewport ?? DEFAULT_META.VIEWPORT} />
                    {keywords && <meta name="keywords" content={keywords} />}
                    {author && <meta name="author" content={author} />}
                    <link rel="icon" type="x-icon" href="/../favicon.ico" />
                    <link rel="stylesheet" href="../styles/palette.css" />
                    {isDev && <script type="module" src="/@vite/client" defer />}
                </head>
                <script src="../scripts/get-system-theme.js" />
                <body style={style}>{children}</body>
            </html>
        </>
    )
}
