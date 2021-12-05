import {sync} from "glob";
import path from "path";
import {Model} from "../Model/Model";
import type {ModelStatic} from "../Model/Types";
import {ModelMetaData} from "./ModelMetaData";

export class MetaDataStore {

	public static models: Map<string, ModelMetaData<any>> = new Map();

	public static async loadModels(dir: string) {
		const modelFiles = sync(dir, {cwd : process.cwd()})
			.map(file => {
				return path.relative(path.resolve(__dirname), path.resolve(file));
			});

		if (!modelFiles.length) {
			console.warn(`Skipping loading models from path: ${dir}, no models are defined here.`);
			return;
		}

		const modules = (await Promise.all(modelFiles.map(async (file) => {
			return {
				resolved : await import(file),
				file     : file,
			};
		})));

		const resolvedModels: {
			modelClass: typeof Model, file: string, fileName: string
		}[] = modules
			.map(({resolved, file}) => {
				const resolvedModuleKeys = Object.keys(resolved);

				for (let key of resolvedModuleKeys) {

					if (!(resolved[key].prototype instanceof Model)) {
						continue;
					}

					const parsedPath = path.parse(file);

					return {
						modelClass : resolved[key],
						file       : file,
						fileName   : parsedPath.name
					};
				}

				return null;
			})
			.filter(module => module !== null)
			.flat(1);

		for (let resolvedModel of resolvedModels) {
			// @ts-ignore
			MetaDataStore.models.set(
				resolvedModel.modelClass.name,
				new ModelMetaData(resolvedModel.modelClass)
			);
		}
	}

	addModel<T extends Model<any>>(model: ModelStatic<T>) {
		const name = model.name;

		if (MetaDataStore.models.has(name)) {
			return;
		}

		MetaDataStore.models.set(name, new ModelMetaData(model as any));
	}

	getModels() {
		return MetaDataStore.models;
	}

	getModelViaName<T extends Model<any>>(modelName: string): ModelMetaData<T> {
		return MetaDataStore.models.get(modelName);
	}

	getModel<T extends Model<any>>(model: ModelStatic<T>): ModelMetaData<T> {
		//@ts-ignore
		const modelName = model.__getModelName();

		return MetaDataStore.models.get(modelName);
	}

}


export const MetaStore = new MetaDataStore();
