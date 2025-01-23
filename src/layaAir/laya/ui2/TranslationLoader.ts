import { IResourceLoader, ILoadTask } from "../net/Loader";
import { Translations } from "./Translations";

export class TranslationsLoader implements IResourceLoader {
    async load(task: ILoadTask) {
        let url = task.url;
        const data = await task.loader.fetch(url, "json", task.progress.createCallback(0.2), task.options);
        if (!data)
            return null;

        let files = data.files || {};
        let jsonFile: string = files[Translations.provider.language];
        if (!jsonFile && Translations.provider.language != data.defaultLanguage)
            jsonFile = files[data.fallbackLanguage];
        let content: any;
        if (jsonFile) {
            content = await task.loader.fetch(jsonFile, "json", task.progress.createCallback(0.8), task.options);
            if (!content)
                return null;
        }
        else
            content = {};
        let inst: Translations;
        if (task.obsoluteInst && (<Translations>task.obsoluteInst).id == data.id)
            inst = <Translations>task.obsoluteInst;
        else
            inst = Translations.create(data.id);
        inst.setContent(Translations.provider.language, content);
        return inst;
    }
}