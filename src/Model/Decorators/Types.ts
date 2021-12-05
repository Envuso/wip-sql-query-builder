import type {Model as ModelInstance} from "../Model";
import type {ModelStatic} from "../Types";

export type DecoratorMeta = {
	target: ModelInstance<any>;
	property: any;
	descriptor: PropertyDescriptor;
}

export enum RelationshipType {
	HAS_MANY = 'has-many',
	HAS_ONE  = 'has-one',
}

export type RelationDefinition = {
	property: string;
	model: ModelStatic<any>;
	foreignKey: string;
	localKey: string;
	type: RelationshipType;
}
