import type {Model} from "./Model";

export enum ModelHookType {
	BEFORE_CREATE = 'beforeCreate',
	AFTER_CREATE  = 'afterCreate',
	BEFORE_DELETE = 'beforeDelete',
	AFTER_DELETE  = 'afterDelete',
	BEFORE_UPDATE = 'beforeUpdate',
	AFTER_UPDATE  = 'afterUpdate',
}

export class ModelHooks<T extends Model<any>> {

	private model: T;

	constructor(model: T) {
		this.model = model;
	}

	public hasHook(type: ModelHookType) {
		return this.model[type] !== undefined;
	}

	public async callHook(type: ModelHookType, data: Partial<T>) {
		if (!this.hasHook(type)) {
			return data;
		}

		const response = await this.model[type](data);

		console.log(`${type} hook response: `, response, data);

		return response;
	}
}
