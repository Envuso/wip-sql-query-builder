import {MetaStore} from "../../MetaData/MetaDataStore";
import type {Model} from "../Model";

export class HasOneRelationship<Current extends Model<any>, Related extends Model<any>> {

	private data: Related = null;

	constructor(
		public currentModel: Current,
		public model: { new(...args: any[]): Related }
	) {
		return new Proxy(this, {
			get : this.__get,
			set : this.__set,
		});
	}

	__get(target: HasOneRelationship<Current, Related>, property: string, receiver: any): any {
		if(MetaStore.getModel(target.model).isAttribute(property)) {
			if(target.data === null) {
				return null;
			}
			return target.data.getAttribute(property);
		}

		return target[property];
	}

	__set(target: HasOneRelationship<Current, Related>, property: string, value: any, receiver: any): boolean {

		if (target[property] !== undefined && property === 'data') {
			target[property] = value;

			return true;
		}

		return false;

	}
}
