import * as mysql from "mysql";
import {RelationshipType} from "../Model/Decorators/Types";
import type {Model} from "../Model/Model";
import {ModelHookType} from "../Model/ModelHooks";
import {MysqlDatabase} from "../MysqlDatabase";

type Binding = {
	key: string;
	type: OperatorType;
	whereType?: WhereType;
	value: any;
}

enum OperatorType {
	EQUALS       = '=',
	GREATER_THAN = '>',
	LESS_THAN    = '<',
	INSERT       = 'INSERT',
	UPDATE       = 'UPDATE',
	WHEREIN      = 'IN',
}

enum QueryType {
	INSERT = 'insert',
	UPDATE = 'update',
	SELECT = 'select',
}

type WhereType = 'AND' | 'OR';

type OrderDirection = 'ASC' | 'asc' | 'DESC' | 'desc';

type SelectBindingType = {
	operator: OperatorType,
	key: string;
	value: any;
}

type SelectBindings = {
	AND: SelectBindingType[],
	OR: SelectBindingType[],
}

export class QueryBuilder<T extends Model<any>> {

	private model: T;

	private queryType: QueryType = QueryType.SELECT;

	public table: string = null;

	public limit: number = null;

	public selectBindings: SelectBindings = {
		AND : [],
		OR  : [],
	};

	public bindings: Binding[] = [];

	public order: { key: string, direction: OrderDirection } = {
		key       : 'id',
		direction : 'ASC'
	};

	constructor(param: T) {
		this.model = param;
		this.table = this.model.tableName;
	}

	addBinding(binding: Binding) {
		this.bindings.push(binding);
	}

	take(limit: number | null) {
		this.limit = limit;

		return this;
	}

	where(key: (keyof T | string), value: any, type: WhereType = 'AND'): this {
		this.selectBindings[type].push({
			key      : key as string,
			value    : value,
			operator : OperatorType.EQUALS
		});

		return this;
	}

	orWhere(key: (keyof T | string), value: any): this {
		this.where(key, value, 'OR');

		//		this.selectBindings['OR'].push({
		//			key      : key as string,
		//			value    : value,
		//			operator : OperatorType.EQUALS
		//		});

		return this;
	}

	whereIn(key: (keyof T | string), values: any[]) {
		this.selectBindings['AND'].push({
			key      : key as string,
			value    : [values],
			operator : OperatorType.WHEREIN
		});

		return this;
	}

	with(relation: keyof T) {
		this.model.eagerLoadRelation(relation as string);

		return this;
	}

	/**
	 * Inserts a new row into the table
	 *
	 * Returns a full model instance if successful.
	 *
	 * "beforeCreate" & "afterCreate" model hooks will be called with this method.
	 *
	 * @param {Partial<T>} obj
	 * @returns {Promise<T | null>}
	 */
	async insert(obj: Partial<T>): Promise<T> {
		this.queryType = QueryType.INSERT;

		obj = await this.model.hooks().callHook(ModelHookType.BEFORE_CREATE, obj);

		this.addBinding({
			key   : 'insert',
			type  : OperatorType.INSERT,
			value : obj
		});

		const result = await this.runQuery(this.toSql(), 'result');

		return await this.model.hooks().callHook(
			ModelHookType.AFTER_CREATE,
			await this.model.query().where('id', result.insertId).first()
		);
	}

	/**
	 * This will call our "beforeUpdate" hook before running the update query.
	 *
	 * The returning value will be the amount of affected rows, not the models
	 * with updated values.
	 *
	 * This method will not call "afterUpdate" model hooks, due to us not knowing which models
	 * we actually updated correctly.
	 *
	 * If you want the afterUpdate hook to be called, or model instances returned, use Model.update() instead.
	 *
	 * @param {Partial<T>} obj
	 * @returns {Promise<number>}
	 */
	async update(obj: Partial<T>): Promise<number> {
		this.queryType = QueryType.UPDATE;

		obj = await this.model.hooks().callHook(ModelHookType.BEFORE_UPDATE, obj);

		for (let key of Object.keys(obj)) {
			this.addBinding({
				key   : key,
				type  : OperatorType.UPDATE,
				value : obj[key]
			});
		}

		const result = await this.runQuery(this.toSql(), 'result');

		return result.affectedRows;//await this.model.hooks().callHook(ModelHookType.AFTER_UPDATE, result as T);
	}

	async first(): Promise<T | null> {
		let result = await this.take(1).get();

		if (!result[0]) {
			return null;
		}

		return this.model.hydrate(result[0]);
	}

	async get(): Promise<T[]> {
		const results = await this.runQuery(this.toSql(), 'data');

		let models = results.map(result => this.model.hydrate(result)) as T[];

		if (this.model.hasRelationsToEagerLoad()) {

			for (let relationshipName of this.model.relationsToEagerLoad) {
				const relation = this.model.getRelationship(relationshipName);
				const modelIds = models.map(m => m[relation.localKey]);

				const relatedData = await relation.model.query()
					.whereIn(relation.foreignKey, modelIds)
					.get();

				models = models.map(model => {
					const filter = r => r[relation.foreignKey] === model[relation.localKey];

					model.relationsToEagerLoad = this.model.relationsToEagerLoad;

					// Set the resolved relation data onto this model.relations object
					model.relations[relation.property] = (
						relation.type === RelationshipType.HAS_MANY
							? relatedData.filter(filter)
							: relatedData.find(filter)
					);

					// Set the resolved relation data on the relation resolver
					// For ex, if we have books() => return this.hasOne()
					// We'll set the loaded relation data on the hasOne class
					// Then we'll assign that hasOne class with it's result onto model.relations
					const relationAccessor = model[relation.property]();
					relationAccessor.data  = model.relations[relation.property];

					// Set the relation accessor(HasOneRelationship for ex) onto the relations object
					model.relations[relation.property] = relationAccessor;

					return model;
				});

			}

		}

		return models;
	}

	private getSelectBindings(): Binding[] {
		return this.bindings.filter(binding => {
			return [
				OperatorType.UPDATE,
				OperatorType.INSERT,
			].includes(binding.type) === false;
		});
	}

	private getInsertBindings(): Binding[] {
		return this.bindings.filter(binding => {
			return [OperatorType.INSERT,].includes(binding.type) === true;
		});
	}

	private getUpdateBindings(): Binding[] {
		return this.bindings.filter(binding => {
			return [OperatorType.UPDATE,].includes(binding.type) === true;
		});
	}

	public isUpdateQuery() {
		return this.queryType === QueryType.UPDATE;
	}

	public isInsertQuery() {
		return this.queryType === QueryType.INSERT;
	}

	public isSelectQuery() {
		return this.queryType === QueryType.SELECT;
	}

	async runQuery<T extends 'result' | 'data'>(
		query: mysql.QueryOptions,
		type: T
	): Promise<T extends 'result' ? mysql.OkPacket : any[]> {
		return MysqlDatabase.connection.query(query);
	}

	toSql(): mysql.QueryOptions {
		let baseQuery      = [`SELECT * from ??`];
		const parts: any[] = [this.table];

		if (this.isInsertQuery()) {
			baseQuery = [`INSERT INTO ?? SET ?`];
			parts.push(this.getInsertBindings()[0].value);
		}

		if (this.isUpdateQuery()) {
			baseQuery = [`UPDATE ?? SET`];

			const queryBindingsStore = [];
			for (let updateBinding of this.getUpdateBindings()) {
				queryBindingsStore.push(`?? = ?`);

				parts.push(updateBinding.key);
				parts.push(updateBinding.value);
			}

			baseQuery.push(queryBindingsStore.join(', '));

		}

		//		const selectBindings = this.getSelectBindings() || [];
		if (this.isSelectQuery() || this.isUpdateQuery()) {

			// if we're doing an update query with a where clause, we need to append where.
			// for example, imagine the following:
			// UPDATE users SET username = 'sam' where username = 'sammeh';
			// At our current point, this query will be in the following stage:
			// UPDATE users SET username = 'sam'
			// We'll append 'WHERE' and then add the select bindings.
			if (this.hasSelectBindings()) {
				baseQuery.push(`WHERE`);

				const selectBindings = this.compileSelectBindings();
				if (selectBindings.bindings.length) {
					baseQuery.push(selectBindings.section);
					parts.push(...selectBindings.bindings);
				}
			}

			if (!this.isUpdateQuery()) {
				baseQuery.push(`ORDER BY ?? ${this.order.direction}`);
				parts.push(this.order.key);

				if (this.limit) {
					baseQuery.push(`LIMIT ?`);
					parts.push(this.limit);
				}
			}

		}

		const sql = baseQuery.join(' ');

		const query = mysql.format(sql, parts);

		console.log({
			sql    : query,
			values : []
		});

		return {
			sql    : query,
			values : []
		};
	}

	public orderBy(id: string, direction: OrderDirection): this {
		this.order.key       = id;
		this.order.direction = direction;

		return this;
	}


	private hasSelectBindings() {
		return (this.selectBindings.AND.length + this.selectBindings.OR.length) > 0;
	}

	private compileSelectBindings() {
		const querySections = [];
		const queryBindings = [];

		const compiledSections = [];

		for (let selectBindingsKey in this.selectBindings) {
			const selectBindings = this.selectBindings[selectBindingsKey];
			const bindings       = [];

			for (let binding of selectBindings) {
				querySections.push(`?? ${binding.operator} ?`);

				bindings.push(binding.key);
				bindings.push(binding.value);
			}

			if (bindings.length) {
				if (selectBindingsKey === 'AND') {
					compiledSections.push(`(${querySections.join(' AND ')}) `);
				}
				if (selectBindingsKey === 'OR') {
					compiledSections.push(`OR (${querySections.join(' AND ')}) `);
				}

				queryBindings.push(...bindings);
			}
		}

		return {
			section  : compiledSections.join(' '),
			bindings : queryBindings,
		};
	}
}
