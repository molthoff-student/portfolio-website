let theme = localStorage.getItem("theme");
if (!theme) {
    const darkmode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = darkmode ? 'dark' : 'light';
    localStorage.setItem("user-theme", theme);
}
document.documentElement.setAttribute('user-theme', theme);