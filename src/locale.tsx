import { createContext, JSXNode, ReactElement, ReactNode, useContext } from 'hono/jsx';
import en from './locales/en.json';
import nl from './locales/nl.json';
import { JSX } from 'hono/jsx/jsx-runtime';

type serializedLocale = {
    name: string,
    data: typeof en
}

export type Msg = {
    (path: string): string;
    <T>(path: string, asObject: true): T;
};

export type Locale = {
    locale: string,
    /**
     * Localization interface.
     * 
     * Can safely fetch strings, or unsafely return Objects with specific types.
     * @param path the string key to look up in the localization data. 
     * @param asObject if true, the overload will unsafe cast the result as the given type `T`.
     * @template T the type to cast the result to if `asObject` is set to true.
     * @returns `string | T`, wether it's `T` depends on the `asObject` parameter.
     * 
     * Example:
     * ```ts
     * const text = msg("path.text"); // Safely gets a string
     * console.log(`${text}`);
     * 
     * const obj = msg<Object>("path.object", true); // Unsafely gets an object
     * console.log(`${obj.text}`);
     * ```
     */
    msg: Msg
}

const localeList: serializedLocale[] = [
    { name: 'en-US', data: en },
    { name: 'nl-NL', data: nl },
];

/**
 * @param type error type
 * @param locale given locale
 * @param path given text path
 * @returns throws an error specific to the given type.
 */
function localeError(
    type: 'missing' | 'object' | 'request',
    locale: string | null,
    path = ''
): never {
    switch (type) {
        case 'missing':
            throw new Error(`locale '${locale ?? 'null'}' doesn't exist.`);
        case 'object':
            throw new Error(`missing object: ${locale ?? 'null'}.${path}`);
        case 'request':
            throw new Error('useLocale must be used inside a request');
    }
};

/**
 * @returns Map<> containing the Key's of all given locales and the Value is the JSON itself.
 */
function mapLocales(): Map<string, typeof en> {
    let localeMap = new Map<string, typeof en>();
    // const localeList = serializeLocales();
    localeList.forEach(({ name, data }) => {
        localeMap.set(name, data);
    });
    return localeMap;
}

/**
 * 
 * @param obj JSON to flatten nested Key's from.
 * @param prefix Initial prefix for the flattened Key
 * @returns Record<> containing flattened Key's for faster lookup.
 */
function flattenJson(obj: any, prefix = "") {
    const result: Record<string, string> = {}

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === "object") {
            Object.assign(result, flattenJson(value, newKey))
        } else {
            result[newKey] = value as string
        }
    }

    return result
}

/**
 * 
 * @param map Map<> containing locale Key's and JSON data to flatten.
 * @returns Map containing locale Key's and Record<>'s for quick string lookups.
 */
function flattenLocaleMap(map: Map<string, typeof en>): Map<string, Record<string, string>> {
    const result = new Map<string, Record<string, string>>();
    map.forEach((localeData, key) => {
        const flat = flattenJson(localeData);
        result.set(key, flat);
    });

    return result
}

/**
 * @readonly `data` containing a Map<string, any> with locales and their JSON data.
 * @readonly `flat` containing a Map<string, Record<>> with locales and flattened JSON Key's.
 * 
 * @method `keys()` returns an iterator over all added locales.
 * @method `has(key: string)` checks if a locale exists.
 * @method `default()` returns the default locale.
 * @method `use()` returns the locale and a message lookup function for the locale.
 */
class locale {
    // Map<> with locale json objects.
    readonly data = mapLocales();
    // Flattens lookup key's for faster lookups on single strings.
    readonly flat = flattenLocaleMap(this.data);
    keys() {
        return [...this.data.keys()];
    };
    has(key: string): boolean {
        return this.data.has(key);
    };
    default(): string {
        return localeList[0].name;
    }
    get(locale: string | null): Locale {
        if (!locale) localeError('request', locale);
        const dataLocale = this.data.get(locale);
        if (!dataLocale) localeError('missing', locale);

        const flatLocale = this.flat.get(locale);
        if (!flatLocale) localeError('missing', locale);

        const msg: Msg = <T,>(
            path: string,
            asObject?: boolean
        ): string | T => {
            if (asObject) {
                const object = path.split(".")
                    .reduce(
                        (current, key) =>
                            current &&
                                typeof current === "object"
                                ? (current as Record<string, unknown>)[key]
                                : undefined,
                        dataLocale as unknown
                    );

                if (object) {
                    return object as T;
                } else {
                    throw localeError('object', locale);;
                }
            }

            const text = flatLocale[path] ?? `${locale}.${path}`;
            return text;
        };

        return { locale, msg }
    }
}

const locales = new locale;

const TranslationContext = createContext<string | null>(
    null
);

type TranslationProviderProps = {
    locale: string;
    children: JSX.Element;
};

export function TranslationProvider(
    {
        locale,
        children,
    }: TranslationProviderProps
) {
    return (
        <TranslationContext.Provider value={locale}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = (): Locale => {
    const locale = useContext(TranslationContext);

    if (!locale) {
        throw new Error(
            "useTranslation must be used within a TranslationProvider"
        );
    }

    const { msg } = locales.get(locale);

    return { locale, msg };
};

export default locales;