const storageItem = 'user-theme';
let theme = localStorage.getItem(storageItem);
if (!theme) {
    const darkmode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = darkmode ? 'dark' : 'light';
    localStorage.setItem(storageItem, theme);
}
document.documentElement.setAttribute(storageItem, theme);