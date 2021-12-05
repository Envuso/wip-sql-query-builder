import {toCamel, toSnake} from "ts-case-convert";
import {MetaStore} from "../MetaData/MetaDataStore";
import type {ModelMetaData} from "../MetaData/ModelMetaData";
import {QueryBuilder} from "../QueryBuilder/QueryBuilder";
import {ModelHooks} from "./ModelHooks";
import {HasManyRelationship} from "./Relations/HasManyRelationship";
import {HasOneRelationship} from "./Relations/HasOneRelationship";
import {
	CastType,
	HasManyRelationAccessor,
	HasOneRelationAccessor,
	ModelAttributesType,
	ModelCasing,
	ModelGrammar,
	ModelPlural,
	ModelRelationAttributesType,
	ModelStatic
} from "./Types";
import type {ModelCastRegistrations} from "./Types";
import pluralize from 'pluralize';

const array_intersect_key = require('locutus/php/array/array_intersect_key');
const array_diff_key      = require('locutus/php/array/array_diff_key');
const array_flip          = require('locutus/php/array/array_flip');
const array_merge         = require('locutus/php/array/array_merge');
const array_key_exists    = require('locutus/php/array/array_key_exists');


export class Model<T extends Model<any>> {

	public modelGrammar: ModelGrammar = {
		tableName            : 'snakecase',
		tableNamePlural      : 'multiple',
		properties           : 'snakecase',
		serializedProperties : 'snakecase'
	};

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

	/**
	 * The data on the model, although they're assigned to the underlying class
	 * they're also assigned here. But this object is only holding the
	 * physical values that have @Property decorator assigned to them
	 *
	 * @type {ModelAttributesType}
	 */
	public attributes: ModelAttributesType = {};

	public relations: ModelRelationAttributesType<T> = {};
	public relationsToEagerLoad: string[]            = [];


	constructor(attributes?: Partial<T>) {

		this.setTable(this.getTable());

		const proxiedModel = new Proxy(this, {
			get : this.__get,
			set : this.__set
		});

		if (attributes !== undefined) {
			proxiedModel.fill(attributes);
		}

		return proxiedModel as T;
	}

	getPrimaryKey() {
		return this[this.primaryKey];
	}

	getTable(): string {
		if (this.tableName) {
			return this.tableName;
		}

		const casedName = this.convertNameCasing(this.constructor.name, this.modelGrammar.tableName);

		return this.convertPluralType(casedName, this.modelGrammar.tableNamePlural);
	}

	setTable(table: string) {
		this.tableName = table;
	}

	private convertPluralType(key: string, plural: ModelPlural) {
		switch (plural) {
			case "single":
				return pluralize.singular(key);
			case "multiple":
				return pluralize.plural(key);
			default:
				return key;
		}
	}

	private convertNameCasing(key: string, casing: ModelCasing): string {
		switch (casing) {
			case "camelcase":
				return toCamel(key);
			case "snakecase":
				return toSnake(key);
			default:
				return key;
		}
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

	metaStore(): ModelMetaData<T> {
		return MetaStore.getModel<T>(this.constructor as (new (...args: any) => Model<any>));
	}

	/**
	 * Hydrate the model from a raw js object
	 *
	 * @param {Partial<T>} data
	 * @returns {T}
	 */
	hydrate(data: Partial<T>): T {

		const model = this.newInstance();

		return model.fill(data);

		// for (let key in data) {
		//      model[key] = data[key];
		//      We won't use setAttribute, since we're using proxies
		//      The above will call the proxy, which calls setAttribute()
		//      model.setAttribute(key, data[key]);
		// }

		// return model as T;
	}

	/**
	 * Get all visible model properties
	 *
	 * If a property is marked as "visible" it will always be returned after serialization, even if "hidden"
	 *
	 * @returns {string[]}
	 */
	getVisible() {
		return this.visible || [];
	}

	/**
	 * Get all hidden model properties
	 *
	 * If a property is marked as "hidden" it will not display when running JSON.stringify(model) / model.toJson()
	 *
	 * @returns {string[]}
	 */
	getHidden() {
		return this.hidden || [];
	}

	//region Attributes

	/**
	 * Get all model properties
	 */
	getAttributes() {
		// TODO
	}

	public setAttribute(key: string, value: any): void {
		this.attributes[key] = this.castAttribute(key, value);
		this[key]            = this.getAttribute(key);
	}

	public getAttribute(key: string, _default: any = null) {

		if (this.attributes[key] === undefined) {
			return _default;
		}

		return this.attributes[key];

	}

	/**
	 * Cast all model attributes based on the developers choice
	 *
	 * For example, bools in sql are ints(0 or 1), we can add a cast to convert them to booleans
	 *
	 * @param {string} key
	 * @param value
	 * @returns {any}
	 */
	castAttribute(key: string, value: any) {
		const castType = this.getCastType(key);

		switch (castType as CastType) {
			case CastType.INT:
			case CastType.INTEGER:
			case CastType.NUMBER:
				return Number(value);
			case CastType.REAL:
			case CastType.FLOAT:
			case CastType.DOUBLE:
			case CastType.DECIMAL:
				return parseFloat(value);
			case CastType.STRING:
				return value.toString();
			case CastType.BOOL:
			case CastType.BOOLEAN:
				return Boolean(value);
			case CastType.OBJECT:
			case CastType.ARRAY:
			case CastType.JSON:
				return JSON.parse(value);
			case CastType.DATE:
			case CastType.DATETIME:
				return new Date(value);
		}

		return value;
	}

	private getSerializableAttributes(values: any) {
		if (this.getVisible().length > 0) {
			values = array_intersect_key(values, array_flip(this.getVisible()));
		}

		if (this.getHidden().length > 0) {
			values = array_diff_key(values, array_flip(this.getHidden()));
		}

		return values;
	}

	/**
	 *
	 * @param {Partial<T>} attributes
	 * @private
	 */
	fill(attributes: Partial<T>): T {
		for (let key in attributes) {
			this.__set(this, key, attributes[key]);

			//			this[key] = attributes[key];
			//			model[key] = data[key];
			// We won't use setAttribute, since we're using proxies
			// The above will call the proxy, which calls setAttribute()
			// model.setAttribute(key, data[key]);
		}

		return this as unknown as T;
	}

	//endregion Attributes

	//region Attribute Casting

	/**
	 * Get all of the defined casts on the model
	 *
	 * @returns {boolean | {} | ModelCastRegistrations}
	 */
	getCasts() {
		if (this.primaryKeyIncrementing) {
			return array_merge({[this.primaryKey] : this.primaryKeyType}, this.casts);
		}

		return this.casts;
	}

	/**
	 * Do we have cast defined for x key?
	 *
	 * @param {string} key
	 * @returns {boolean}
	 */
	hasCast(key: string) {
		if (array_key_exists(key, this.getCasts())) {
			return true;
		}

		return false;
	}

	/**
	 * Get the cast type for the key(if any is defined)
	 *
	 * @param {string} key
	 * @returns {string | null}
	 */
	getCastType(key: string) {
		const cast = this.getCasts()[key] as string;

		if (!cast) {
			return null;
		}

		return cast.trim().toLowerCase();
	}

	//endregion Attribute Casting

	//region Relationships

	getRelationships() {
		return this.metaStore().getRelationships();
	}

	getRelationship(relation: string) {
		return this.metaStore().getRelationship(relation);
	}

	eagerLoadRelation(relation: string) {
		if (!this.metaStore().hasRelationship(relation as string)) {
			return;
		}

		this.relationsToEagerLoad.push(relation as string);
	}

	hasRelationsToEagerLoad() {
		return this.relationsToEagerLoad.length > 0;
	}

	private relationIsLoaded(property: string): Boolean {
		return this.relations[property] !== undefined && this.relationsToEagerLoad.includes(property);
	}

	hasMany<FM extends Model<any>>(model: new (...args: any[]) => FM): HasManyRelationAccessor<T, FM> {
		return new HasManyRelationship(this, model) as unknown as HasManyRelationAccessor<T, FM>;
	}

	hasOne<FM extends Model<any>>(model: new (...args: any[]) => FM): HasOneRelationAccessor<T, FM> {
		return new HasOneRelationship(this, model) as unknown as HasOneRelationAccessor<T, FM>;
	}

	//endregion Relationships


	public static query<M extends Model<any>>(this: new () => M): QueryBuilder<M> {
		return new this().query();
	}

	__get(target: Model<T>, p: string | symbol, receiver: any): any {
		const property = p.toString();

		if (target.metaStore().isAttribute(property)) {
			return target.getAttribute(property);
		}

		if (target.metaStore().hasRelationship(property) && target.relationIsLoaded(property)) {
			const relation = target.relations[property];

			if (relation instanceof HasOneRelationship || relation instanceof HasManyRelationship) {
				return () => relation;
			}
		}

		return target[property];
	}

	__set(target: Model<T>, p: string | symbol, value: any, receiver?: any): boolean {
		const property = p.toString();

		if (!target.metaStore().isProperty(property)) {
			return false;
		}

		target.setAttribute(property, value);

		return true;
	}

}
