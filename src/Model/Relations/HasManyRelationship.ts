import type {Model} from "../Model";
import {BaseRelation} from "./BaseRelation";

export class HasManyRelationship<Current extends Model<any>, Related extends Model<any>> extends BaseRelation<Current, Related> {

	private data: Related[] = [];

	constructor(
		protected currentModel: Current,
		protected model: { new(...args: any[]): Related }
	) {
		super(currentModel, model);

		return new Proxy(this, {
			get : this.__get,
			set : this.__set,
		});
	}

	__get(target: HasManyRelationship<Current, Related>, property: string, receiver: any): any {

		if (target[property] !== undefined) {
			return target[property];
		}

		if (typeof target.data[property] === 'function') {
			const method = target.data[property];

			return function (...args) {
				return method.call(target.data, ...args);
			};
		}

		return target.data[property];
	}

	__set(target: HasManyRelationship<Current, Related>, property: string, value: any, receiver: any): boolean {

		if (target[property] !== undefined && property === 'data') {
			target[property] = value;

			return true;
		}

		return false;

	}


}
