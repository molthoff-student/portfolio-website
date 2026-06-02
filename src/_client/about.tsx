import { useState } from "hono/jsx";
import { mount } from "../utility/client";
import locales from "../locale";

export type AboutProps = {
    locale: string
}

function About(
    {
        locale,
    }: AboutProps
) {
    const { msg } = locales.get(locale);
    const [count, setCount] = useState(0);  

    return (
        <>
            <p>{`locale: ${locale}`}</p>
            <p>{msg("homepage.title")}</p>
            <button value={count} onClick={() => setCount(count + 1)}/>
            <p>{count}</p>
        </>
    );
}

mount(document, About);