import type {Model} from "../Model";

export class BaseRelation<Current extends Model<any>, Related extends Model<any>> {

	protected _isLoaded: boolean = false;

	constructor(
		protected currentModel: Current,
		protected model: { new(...args: any[]): Related }
	) { }



}
