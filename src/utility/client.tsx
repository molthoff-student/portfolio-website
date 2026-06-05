import { createRoot } from "hono/jsx/dom/client";
import { createElement, JSX as honoJSX } from "hono/jsx";
import { JSX as RuntimeJSX } from "hono/jsx/jsx-runtime";

const PAGE_PROPERTIES = "__PAGE_PROPERTIES";

export type RenderProps<T> = {
    path: string
    data?: T
    attributes?: honoJSX.HTMLAttributes 
}

export function Render<T extends object>(
    {
        path,
        data,
        attributes
    }: RenderProps<T>
) {
    return (
        <>
            <div {...attributes} id="root"></div>
            <script type="module" src={path} />
            {data && (
                <script
                    type="application/json"
                    id={PAGE_PROPERTIES}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
                    }}
                />
            )}
        </>
    );
}

export function mount<T extends object>(
    document: Document,
    element: (props: T) => RuntimeJSX.Element
) {
    if (typeof document === "undefined") {
        throw new Error("Failed to obtain page document");
    }

    const root = document.getElementById("root");
    if (!root) throw new Error("Failed to get page root");

    const props = document.getElementById(PAGE_PROPERTIES);
    if (props) {
        const json = JSON.parse(props.textContent || "{}") as T;
        createRoot(root).render(createElement(element, json));
    } else {
        createRoot(root).render(createElement(element, {}));
    }
}