import {MetaStore} from "../../MetaData/MetaDataStore";
import type {Model} from "../Model";
import type {ModelStatic} from "../Types";
import {BaseRelation} from "./BaseRelation";

export class HasOneRelationship<Current extends Model<any>, Related extends Model<any>> extends BaseRelation<Current, Related> {

	private data: Related = null;

	constructor(
		protected currentModel: Current,
		protected model: ModelStatic<Related>
	) {
		super(currentModel, model);

		return new Proxy(this, {
			get : this.__get,
			set : this.__set,
		});
	}

	__get(target: HasOneRelationship<Current, Related>, property: string, receiver: any): any {

		if (!MetaStore.getModel(target.model).isAttribute(property)) {

			const queryBuilder          = target.model.query();
			const queryMethod: Function = queryBuilder[property];

			if (queryMethod !== undefined && typeof queryMethod === 'function') {
				return function (...args) {
					return queryMethod.call(queryBuilder, ...args);
				};
			}

		}

		if (target.data === null) {
			return null;
		}

		return target.data.getAttribute(property);

	}

	__set(target: HasOneRelationship<Current, Related>, property: string, value: any, receiver: any): boolean {

		if (target[property] !== undefined && property === 'data') {
			target[property] = value;

			return true;
		}

		return false;

	}
}
