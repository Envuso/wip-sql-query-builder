import {MetaStore} from "../../MetaData/MetaDataStore";
import type {Model as ModelInstance} from "../Model";
import type {ModelStatic} from "../Types";
import {RelationDefinition, RelationshipType} from "./Types";

export function getModelConstructor(name: string) {
	return (Reflect.getMetadata('models', Reflect) || []).find(model => {
		return model.name === name;
	});
}

function defineModel(constructor) {
	Reflect.defineMetadata('models', [
		...(Reflect.getMetadata('models', Reflect) || []),
		{constructor : constructor.constructor, name : constructor.constructor.name},
	], Reflect);
}

export function Model<T extends ModelInstance<any>>(constructor: ModelStatic<T>) {
	//	const meta = getRelationMeta(constructor.prototype);

	//	MetaStore.addModel(constructor);
	defineModel(constructor.prototype);
}

export function getModelProperties(modelName: string): string[] {
	return (Reflect.getMetadata(`properties:${modelName}`, Reflect) || []);
}

export function defineModelProperty(modelName: string, propertyName: string) {
	Reflect.defineMetadata(
		`properties:${modelName}`,
		[...getModelProperties(modelName), propertyName],
		Reflect
	);
}

export function Property<T extends ModelInstance<any>>(target: T, property: any) {
	defineModelProperty(target.constructor.name, property as string);
}

type RelationMetaDefinition = {
	property: string;
	foreignKey: string;
	localKey: string;
	type: RelationshipType;
	model: string;
}

export function defineRelation(target, meta: RelationMetaDefinition) {
	Reflect.defineMetadata('relations', [
		...getRelationMeta(target), meta
	], target);
}

export function getRelationMeta(target): RelationMetaDefinition[] {
	return Reflect.getMetadata('relations', target) || [];
}

export function HasMany<T extends ModelInstance<any>>(model: string, foreignKey: string, localKey: string) {
	return function (target: any, property: any, descriptor: PropertyDescriptor) {

		defineRelation(target, {
			model,
			foreignKey,
			localKey,
			property,
			type : RelationshipType.HAS_MANY
		});

		//		const relatedModel = MetaStore.getModel(typeof model === 'string' ? model : model.name);
		//
		//		MetaStore.getModel(target).addRelationship({
		//			model : relatedModel.modelConstructor, foreignKey, localKey, property, type : RelationshipType.HAS_MANY
		//		});
	};
}

export function HasOne<T extends ModelInstance<any>>(model: string, foreignKey: string, localKey: string) {
	return function (target: any, property: any, descriptor: PropertyDescriptor) {

		defineRelation(target, {
			model,
			foreignKey,
			localKey,
			property,
			type : RelationshipType.HAS_ONE
		});

		//		debugger;
		//		const relatedModel = MetaStore.getModel(typeof model === 'string' ? model : model.name);
		//
		//		MetaStore.getModel(target).addRelationship({
		//			model : relatedModel.modelConstructor,
		//			foreignKey,
		//			localKey,
		//			property,
		//			type  : RelationshipType.HAS_ONE
		//		});
	};
}

