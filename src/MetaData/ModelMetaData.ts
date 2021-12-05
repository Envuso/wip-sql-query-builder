import {getModelConstructor, getRelationMeta} from "../Model/Decorators/Model";
import type {RelationDefinition} from "../Model/Decorators/Types";
import type {Model} from "../Model/Model";
import type {ModelStatic} from "../Model/Types";

export class ModelMetaData<T extends Model<any>> {

	public modelConstructor: ModelStatic<T>;
	public modelBaseInstance: T;
	public propertyKeys: Set<string>;
	public attributes: Map<string, any>;
	public relationships: Map<string, RelationDefinition>;

	constructor(model: ModelStatic<T>) {

		this.modelConstructor  = model;
		this.modelBaseInstance = new model();

		const keys = Reflect.ownKeys(this.modelBaseInstance) as string[];

		this.propertyKeys = new Set(keys);

		this.attributes    = new Map();
		this.relationships = new Map();

		this.setMetadataProperties();
		this.setModelAttributes();
		this.setModelRelations();
	}

	setMetadataProperties() {
		getRelationMeta(this.modelConstructor.prototype).forEach(relation => {
			if (typeof relation.model === 'string') {
				const relationData: RelationDefinition = {
					property   : relation.property,
					model      : getModelConstructor(relation.model as string).constructor,
					foreignKey : relation.foreignKey,
					localKey   : relation.localKey,
					type       : relation.type,
				};

				this.addRelationship(relationData);
			}
		});

	}

	private setModelAttributes() {
		this.propertyKeys.forEach(key => {
			const type = Reflect.getMetadata("design:type", this.modelConstructor.prototype, key);

			if (type === undefined) {
				return;
			}

			this.attributes.set(key, type);
		});
	}

	private setModelRelations() {
		const relationships = Reflect.getMetadata('model:relationships', this.modelConstructor) || [];

		const d  = Reflect.getMetadata('model:relationships', this.modelConstructor.prototype);
		const dd = Reflect.getMetadata('model:relationships', this.modelConstructor.prototype.constructor);

		for (let relationship of relationships) {
			this.addRelationship(relationship);
		}
	}

	isProperty(key: string): boolean {
		return this.isAttribute(key) || this.propertyKeys.has(key as string);
	}

	isAttribute(key: string): boolean {
		return this.attributes.has(key);
	}

	getRelationships(): RelationDefinition[] {
		return [...this.relationships.values()];
	}

	addRelationship(relation: RelationDefinition) {
		this.relationships.set(relation.property, relation);
	}

	getRelationship(property: string): RelationDefinition | null {
		return this.relationships.get(property) ?? null;
	}

	hasRelationship(property: string): boolean {
		return this.relationships.has(property);
	}

	public isRelatedModel<T extends Model<any>>(model: new(...args: any) => T): boolean {
		return this.getRelationFromModel(model) !== undefined;
	}

	public getRelationFromModel<T extends Model<any>>(model: new(...args: any) => T): RelationDefinition | undefined {
		//@ts-ignore
		return Array.from(this.relationships.values()).find(r => r.model.name === model.name);
	}
}

