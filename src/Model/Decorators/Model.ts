import {MetaStore} from "../../MetaData/MetaDataStore";
import type {Model as ModelInstance} from "../Model";
import type {ModelStatic} from "../Types";
import {RelationshipType} from "./Types";

export function Model(constructor: new (...args: any) => ModelInstance<any>) {
	MetaStore.addModel(constructor);
	console.log('Defined model registration meta', constructor.name);
}

export function Property(target: ModelInstance<any>, property: any) {
	MetaStore.addModelProperty(target, property);
}

export function HasMany<T extends ModelInstance<any>>(model: ModelStatic<T>, foreignKey: string, localKey: string) {
	return function (target: any, property: any, descriptor: PropertyDescriptor) {
		MetaStore.getModel(target).addRelationship({
			model, foreignKey, localKey, property, type : RelationshipType.HAS_MANY
		});
	};
}

export function HasOne<T extends ModelInstance<any>>(model: ModelStatic<T>, foreignKey: string, localKey: string) {
	return function (target: any, property: any, descriptor: PropertyDescriptor) {
		MetaStore.getModel(target).addRelationship({
			model, foreignKey, localKey, property, type : RelationshipType.HAS_ONE
		});
	};
}

