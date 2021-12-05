import type {Model} from "../Model/Model";
import {ModelMetaData} from "./ModelMetaData";

export class MetaDataStore {

	public static models: Map<string, ModelMetaData<any>> = new Map();

	addModel(model: new (...args: any) => Model<any>) {
		if (MetaDataStore.models.has(model.name)) {
			return;
		}

		MetaDataStore.models.set(model.name, new ModelMetaData(model));
	}

	getModels() {
		return MetaDataStore.models;
	}

	getModel<T extends object>(model: (new (...args: any) => Model<any>)): ModelMetaData<T> {

		if (!MetaDataStore.models.has(model.name)) {
			this.addModel(model.constructor as new (...args: any) => Model<any>);
			return MetaDataStore.models.get(model.constructor.name);
		}

		return MetaDataStore.models.get(model.name);
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
