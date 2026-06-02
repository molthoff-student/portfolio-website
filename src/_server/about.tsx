import { Context } from "hono";
import { Meta } from "../utility/meta";
import { Render } from "../utility/client";
import useLocale from "../useLocale";
import { AboutProps } from "../_client/about";

export function AboutPage(c: Context) {

    const { locale } = useLocale();

    return c.render(
        <>
            <Meta>
                <Render<AboutProps> path="/src/_client/about.tsx" data={{locale}} />
            </Meta>
        </>
    )
}