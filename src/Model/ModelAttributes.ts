import type {Model} from "./Model";

const array_intersect_key = require('locutus/php/array/array_intersect_key');
const array_diff_key      = require('locutus/php/array/array_diff_key');
const array_flip          = require('locutus/php/array/array_flip');
const array_merge         = require('locutus/php/array/array_merge');
const array_key_exists    = require('locutus/php/array/array_key_exists');

export enum CastType {
	ARRAY    = 'array',
	BOOL     = 'bool',
	BOOLEAN  = 'boolean',
	DATE     = 'date',
	DATETIME = 'datetime',
	DECIMAL  = 'decimal',
	DOUBLE   = 'double',
	FLOAT    = 'float',
	INT      = 'int',
	INTEGER  = 'integer',
	NUMBER   = 'number',
	JSON     = 'json',
	OBJECT   = 'object',
	REAL     = 'real',
	STRING   = 'string',
}

export type ModelCastRegistrations = {
	[key: string]: CastType | any,
}

export class ModelAttributes<T extends Model<any>> {

	private model: T;

	constructor(model: T) {
		this.model = model;
	}

	/**
	 * Get all of the defined casts on the model
	 *
	 * @returns {boolean | {} | ModelCastRegistrations}
	 */
	getCasts() {
		if (this.model.primaryKeyIncrementing) {
			return array_merge({[this.model.primaryKey] : this.model.primaryKeyType}, this.model.casts);
		}

		return this.model.casts;
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

	/**
	 * Get all visible model properties
	 *
	 * If a property is marked as "visible" it will always be returned after serialization, even if "hidden"
	 *
	 * @returns {string[]}
	 */
	getVisible() {
		return this.model.visible || [];
	}

	/**
	 * Get all hidden model properties
	 *
	 * If a property is marked as "hidden" it will not display when running JSON.stringify(model) / model.toJson()
	 *
	 * @returns {string[]}
	 */
	getHidden() {
		return this.model.hidden || [];
	}

	/**
	 * Get all model properties
	 */
	getAttributes() {
		// TODO
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

}
