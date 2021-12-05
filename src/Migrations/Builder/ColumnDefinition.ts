import {MysqlDatabase} from "../../MysqlDatabase";
import {ColumnCompilation} from "../ColumnCompilation";
import type {MysqlColumnTypes} from "../Types";

export class ColumnDefinition {


	private _name: string;
	private _type: MysqlColumnTypes;
	private _additional?: any  = {};
	private _tableName: string = null;

	private _index: { name: string } | null = null;

	/**
	 * Should this column be unique?
	 *
	 * If so, we can specify a custom name for this column also.
	 *
	 * @type {boolean}
	 * @private
	 */
	private _unique: { name: string } | null = null;

	/**
	 * Is this column nullable?
	 *
	 * @type {boolean}
	 * @private
	 */
	private _nullable: boolean = false;

	/**
	 * Do we want to auto increment our primary key/is this the primary key?
	 * @type {boolean}
	 * @private
	 */
	private _autoIncrement: boolean = false;
	/**
	 * Is it an unsigned int column?
	 *
	 * @type {boolean}
	 * @private
	 */
	private _unsigned: boolean      = false;

	// Related to string column types
	private _length: number = null;

	// Related to date column types
	private _precision: number            = null;
	/**
	 * If true, this column will use CURRENT_TIMESTAMP on mysql as it's default value
	 *
	 * @type {boolean}
	 * @private
	 */
	private _useCurrentTimestamp: boolean = false;

	private _default: any = undefined;

	/**
	 * Did we apply a .change() call to this definition?
	 *
	 * IE; Do we want to modify this column in our migration?
	 *
	 * @type {boolean}
	 * @private
	 */
	private _changing: boolean = false;


	constructor(name: string, type: MysqlColumnTypes, data: any, tableName: string) {
		this._name       = name;
		this._type       = type;
		this._additional = data || {};
		this._tableName  = tableName;

		if (this._additional.autoIncrements) {
			this.autoIncrement();
		}

		if (this._additional.precision) {
			this.precision(this._additional.precision);
		}

		if (this._additional.length) {
			this.length(this._additional.length);
		}

		if (this._additional.unsigned) {
			this.unsigned();
		}
	}


	getName() {
		return this._name;
	}

	getAdditional() {
		return this._additional;
	}

	//region Column Indexes

	private indexName(type: 'unique' | 'index'): string {
		return [
			this._tableName,
			this._name,
			type,
		].join('_').toLowerCase();
	}

	getAllIndexes(): { type: 'unique' | 'index' | string, name: string, column: string }[] {
		return [
			{type : 'unique', name : this.getUniqueIndexName(), column : this.getName()},
			{type : 'index', name : this.getIndexName(), column : this.getName()},
		].filter((index) => index.name !== null);
	}

	hasAnyIndexes(): boolean {
		return this.hasIndex() || this.hasUniqueIndex();
	}

	index(name: string = null): this {
		this._index = {
			name : name ?? this.indexName('index'),
		};

		return this;
	}

	hasIndex(): boolean {
		return this._index !== null;
	}

	getIndexName(): string | null {
		return this._index?.name ?? null;
	}

	unique(indexName: string = null): this {
		this._unique = {
			name : indexName ?? this.indexName('unique'),
		};

		return this;
	}

	hasUniqueIndex(): boolean {
		return this._unique !== null;
	}

	getUniqueIndexName(): string | null {
		return this._unique?.name ?? null;
	}

	//endregion Column Indexes

	nullable(value: boolean = true): this {
		this._nullable = value;

		return this;
	}

	isNullable(): boolean {
		return this._nullable;
	}

	unsigned(): this {
		this._unsigned = true;

		return this;
	}

	/**
	 * This will mark the column as the primary key.
	 *
	 * @returns {this}
	 */
	autoIncrement() {
		this._autoIncrement = true;

		return this;
	}

	isAutoIncrementing(): boolean {
		return this._autoIncrement;
	}

	getType(): MysqlColumnTypes {
		return this._type;
	}

	compileType() {
		return ColumnCompilation.getTypeFor(this);
	}

	length(length: number): this {
		this._length = length;

		return this;
	}

	getLength(): number | null {
		return this._length;
	}

	precision(precision: number): this {
		this._precision = precision;

		return this;
	}

	getPrecision(): number | null {
		return this._precision;
	}

	default(_default: any): this {
		this._default = _default;

		return this;
	}

	getDefault(): any {
		return this._default;
	}

	hasDefault() {
		return this._default !== undefined;
	}

	useCurrentTimestamp(): this {
		this._useCurrentTimestamp = true;

		return this;
	}

	isUsingCurrentTimestamp(): boolean {
		return this._useCurrentTimestamp;
	}


	change() {
		this._changing = true;

		return this;
	}

	isChange(): boolean {
		return this._changing;
	}


}
