import { IResourceLoader, ILoadTask } from "../net/Loader";
import { Translations } from "./Translations";

/** @ignore */
export class TranslationsLoader implements IResourceLoader {
    load(task: ILoadTask) {
        let url = task.url;
        return task.loader.fetch(url, "json", task.progress.createCallback(0.2), task.options).then(data => {
            if (!data)
                return null;

            let files = data.files || {};
            let jsonFile: string = files[Translations.provider.language];
            if (!jsonFile && Translations.provider.language != data.defaultLanguage)
                jsonFile = files[data.fallbackLanguage];
            let awaitor: Promise<any>;
            if (jsonFile)
                awaitor = task.loader.fetch(jsonFile, "json", task.progress.createCallback(0.8), task.options);
            else
                awaitor = Promise.resolve({});
            return awaitor.then(content => {
                let inst: Translations;
                if (task.obsoluteInst && (<Translations>task.obsoluteInst).id == data.id)
                    inst = <Translations>task.obsoluteInst;
                else
                    inst = Translations.create(data.id);
                inst.setContent(Translations.provider.language, content);
                return inst;
            });
        });
    }
}