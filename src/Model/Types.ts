import type {QueryBuilder} from "../QueryBuilder/QueryBuilder";
import type {Model} from "./Model";
import type {HasManyRelationship} from "./Relations/HasManyRelationship";
import type {HasOneRelationship} from "./Relations/HasOneRelationship";

export type ModelCasing = 'snakecase' | 'camelcase';
export type ModelPlural = 'single' | 'multiple';

export type ModelGrammar = {
	tableName: ModelCasing;
	tableNamePlural: ModelPlural;
	properties: ModelCasing;
	serializedProperties: ModelCasing;
}

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

export type ModelAttributesType = { [key: string]: any };


export type ProxiedModel<T extends object> = ProxyHandler<T> & T;

export interface ModelStatic<T extends Model<any>> {
	//	constructor(attributes?: Partial<T>): T;

	//	new(attributes?: Partial<T>): T;
	//	(): T;
	new(attributes?: Partial<T>): T;

	query(): QueryBuilder<T>;
}


export type ModelRelatedData<T extends Model<any>, R extends Model<any>> = HasManyRelationship<T, R> | HasOneRelationship<T, R>;

export type ModelRelationAttributesType<T extends Model<any>> = {
	[key: string]: ModelRelatedData<T, any>
};

export type HasOneRelationAccessor<T extends Model<any>, R extends Model<any>> = R & QueryBuilder<R> & HasOneRelationship<T, R>;
export type HasManyRelationAccessor<T extends Model<any>, R extends Model<any>> = R[] & QueryBuilder<R> & HasManyRelationship<T, R>;


type ModelPropertyNames<T> = {
	[K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type ModelPropertiesOnly<T> = {
	[P in ModelPropertyNames<T>]: T[P] extends object ? ModelProps<T[P]> : T[P]
};
export type ModelProps<T> = ModelPropertiesOnly<T>;
export type ArrayOfModelProps<T> = (keyof ModelProps<T>)[];
export type SingleModelProp<T> = keyof ModelProps<T>;


