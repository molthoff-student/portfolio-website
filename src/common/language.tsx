import languageData from "../../public/assets/languages.json";

export type language = {
    img: string,
    url: string | undefined,
}

const languageIcons = '../assets/language-icons/';

const languages = new Map<string, language>(
    languageData.map(lang => {
        const language: language = { 
            img: languageIcons + lang.name + '.png', 
            url: lang.link
        };
        return [lang.name, language];
    })
);

const noLanguage = {
    img: languageIcons + 'Undefined.png',
    url: undefined
}

export function getLang(lang: string | null): language {
    if (!lang) return noLanguage;
    return languages.get(lang) ?? noLanguage;
}
