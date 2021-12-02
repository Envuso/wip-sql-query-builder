import {MetaStore} from "../../MetaDataStore";
import type {Model as ModelInstance} from "../Model";

export function Model(constructor: new (...args: any) => ModelInstance) {
	MetaStore.addModel(constructor);
}

export function Property(target: ModelInstance, property: any) {

	MetaStore.addModelProperty(target, property);
}
