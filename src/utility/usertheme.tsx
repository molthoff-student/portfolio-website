import { useState } from "hono/jsx";

export type UserTheme = 'dark' | 'light'

export const userthemes = [
    'dark',
    'light'
];

type MaybeTheme = string | UserTheme | null;
const storageItem = 'user-theme';

function setUserTheme(maybeTheme: MaybeTheme): UserTheme {
    let theme = maybeTheme;
    const isValid = userthemes.some(e => e === theme);
    if (!theme || !isValid) {
        const darkmode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = darkmode ? 'dark' : 'light';
    }

    localStorage.setItem(storageItem, theme);
    document.documentElement.setAttribute(storageItem, theme);

    return theme as UserTheme;
}

function getUserTheme(): UserTheme {
    const maybeTheme = localStorage.getItem(storageItem);
    const theme = setUserTheme(maybeTheme);

    return theme as UserTheme;
}

export function useTheme() {
    const userTheme = getUserTheme();
    const [theme, setThemeState] = useState(userTheme);
    const setTheme = (theme: MaybeTheme) => {
        console.log(`setTheme(theme: ${theme})`);
        const next = setUserTheme(theme);
        console.log(`next: ${next})`);
        setThemeState(next);
    };

    return [theme, setTheme] as const;
}