import type {Model} from "./Model/Model";

export type ModelRegistration<T> = {
	constructor: T;
	propertyKeys: Set<keyof T>;
	properties: Map<keyof T, T[keyof T]>;
}

export class MetaDataStore {

	public static models: Map<string, ModelRegistration<any>> = new Map();

	addModel(model: new (...args: any) => Model) {
		if (MetaDataStore.models.has(model.name)) {
			return;
		}

		const modelInst    = new model();
		const propertyKeys = Reflect.ownKeys(modelInst);

		MetaDataStore.models.set(model.name, {
			constructor  : model,
			propertyKeys : new Set(propertyKeys),
			properties   : new Map(propertyKeys.map(k => [k, Reflect.getMetadata("design:type", model.prototype, k)]))
		});
	}

	getModels() {
		return MetaDataStore.models;
	}

	getModel(key: string) {
		return MetaDataStore.models.get(key as string);
	}

	public addModelProperty(model: any, property: any): void {

//		let modelMeta = MetaDataStore.models.get(model.name);
//
//		if (!modelMeta) {
//			this.addModel(model.constructor);
//
//			modelMeta = MetaDataStore.models.get(model.name);
//		}
//
//		const type = Reflect.getMetadata("design:type", model, property);
//
//		modelMeta.properties.set(property, type);

	}
}


export const MetaStore = new MetaDataStore();
