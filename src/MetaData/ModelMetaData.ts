import type {RelationDefinition} from "../Model/Decorators/Types";

export class ModelMetaData<T extends object> {

	public modelConstructor: new(...args: any) => T;
	public modelBaseInstance: T;
	public propertyKeys: Set<string>;
	public attributes: Map<string, any>;
	public relationships: Map<string, RelationDefinition>;

	constructor(model: new(...args: any) => T) {

		this.modelConstructor  = model;
		this.modelBaseInstance = new model();

		const keys = Reflect.ownKeys(this.modelBaseInstance) as string[];

		this.propertyKeys = new Set(keys);

		this.attributes    = new Map();
		this.relationships = new Map();

		this.setModelAttributes();
		this.setModelRelations();
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

}
