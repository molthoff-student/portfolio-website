const storageItem = 'user-theme';

const userthemes = ['dark', 'light'];

let theme = localStorage.getItem(storageItem);
const isValid = userthemes.some(e => e === theme);
if (!theme || !isValid) {
    const darkmode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = darkmode ? 'dark' : 'light';
    localStorage.setItem(storageItem, theme);
}

document.documentElement.setAttribute(storageItem, theme);