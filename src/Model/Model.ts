import {QueryBuilder} from "../QueryBuilder/QueryBuilder";
import {ModelHooks} from "./ModelHooks";

export class Model {

	public tableName: string = null;

	constructor() {
		this.tableName = this.constructor.name.toLowerCase();
	}

	hooks() {
		return new ModelHooks(this);
	}

	query(): QueryBuilder<this> {
		return new QueryBuilder(this);
	}

}
