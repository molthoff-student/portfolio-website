import { Locale } from "./locale";
import { getContext } from "hono/context-storage";
import { Env } from ".";
import locales from "./locale";

export default function useLocale(): Locale {
        const context = getContext<Env>();
        const locale = context.var.locale;
        return locales.get(locale);
    };