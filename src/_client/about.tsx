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

    return (
        <>

        </>
    );
}

mount(document, About);