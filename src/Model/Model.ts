import {QueryBuilder} from "../QueryBuilder/QueryBuilder";
import {ModelAttributes, ModelCastRegistrations} from "./ModelAttributes";
import {ModelHooks} from "./ModelHooks";

export class Model<T extends Model<any>> {

	/**
	 * The name of the table, either lowercased
	 * model name or custom name defined by the developer.
	 * @type {string}
	 */
	public tableName: string = null;

	/**
	 * The primary key property
	 *
	 * @type {string}
	 */
	public primaryKey: string = 'id';

	/**
	 * The type of the primary key property
	 *
	 * @type {string}
	 */
	public primaryKeyType: string = 'number';

	/**
	 * Are primary keys using auto increment?
	 *
	 * @type {boolean}
	 */
	public primaryKeyIncrementing: boolean = true;

	/**
	 * Model casts defined by the developer to convert to a type.
	 *
	 * @type {ModelCastRegistrations}
	 */
	public casts: ModelCastRegistrations = {};

	/**
	 * Properties marked as always visible when serialized.
	 *
	 * @type {string[]}
	 */
	public visible: string[] = [];

	/**
	 * Properties marked as hidden when serialized, for example, passwords.
	 *
	 * @type {string[]}
	 */
	public hidden: string[] = [];

	constructor() {
		this.tableName = this.constructor.name.toLowerCase();
	}

	getPrimaryKey() {
		return this[this.primaryKey];
	}

	/**
	 * Get the model attribute/casting manager
	 *
	 * @returns {ModelAttributes<Model<T>>}
	 */
	attributes() {
		return new ModelAttributes(this);
	}

	/**
	 * Get the model hook manager
	 *
	 * @returns {ModelHooks<Model<T>>}
	 */
	hooks() {
		return new ModelHooks(this);
	}

	/**
	 * Get an instance of the query builder
	 *
	 * @returns {QueryBuilder<this>}
	 */
	query(): QueryBuilder<this> {
		return new QueryBuilder(this);
	}

	/**
	 * Create a new instance of this model
	 *
	 * @returns {T}
	 */
	newInstance(): T {
		return new (this.constructor as any)();
	}

	/**
	 * Hydrate the model from a raw js object
	 *
	 * @param {Partial<T>} data
	 * @returns {T}
	 */
	hydrate(data: Partial<T>): T {

		const attributes = this.attributes();

		const model = this.newInstance();

		for (let key in data) {
			model[key] = attributes.castAttribute(key, data[key]);
		}

		return model as T;

	}

}
