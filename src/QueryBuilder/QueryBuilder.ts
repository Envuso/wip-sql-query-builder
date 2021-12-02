import * as mysql from "mysql";
import type {Model} from "../Model/Model";
import {ModelHookType} from "../Model/ModelHooks";
import {MysqlDatabase} from "../MysqlDatabase";

type Binding = {
	key: string;
	type: BindingType;
	value: any;
}

enum BindingType {
	EQUALS       = '=',
	GREATER_THAN = '>',
	LESS_THAN    = '<',
	INSERT       = 'INSERT',
	UPDATE       = 'UPDATE',
}

enum QueryType {
	INSERT = 'insert',
	UPDATE = 'update',
	SELECT = 'select',
}

export class QueryBuilder<T extends Model> {

	private model: T;

	private queryType: QueryType = QueryType.SELECT;

	public table: string = null;

	public limit: number = null;

	public bindings: Binding[] = [];

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

	where(key: keyof T, value: any): this {
		this.addBinding({
			key   : key as string,
			type  : BindingType.EQUALS,
			value : value,
		});

		return this;
	}

	insert(obj: Partial<T>) {
		this.queryType = QueryType.INSERT;

		this.addBinding({
			key   : 'insert',
			type  : BindingType.INSERT,
			value : obj
		});


		return MysqlDatabase.connection.query(this.toQueryData());
	}

	async update(obj: Partial<T>) {
		this.queryType = QueryType.UPDATE;

		obj = await this.model.hooks().callHook(ModelHookType.BEFORE_UPDATE, obj);

		for (let key of Object.keys(obj)) {
			this.addBinding({
				key   : key,
				type  : BindingType.UPDATE,
				value : obj[key]
			});
		}

		const result = await MysqlDatabase.connection.query(this.toQueryData());

		return await this.model.hooks().callHook(ModelHookType.AFTER_UPDATE, result as T);
	}

	async first() {
		const result = await this.take(1).get();

		return result[0] ?? null;
	}

	get() {
		return MysqlDatabase.connection.query(
			this.toQueryData()
		);
	}

	private getSelectBindings(): Binding[] {
		return this.bindings.filter(binding => {
			return [
				BindingType.UPDATE,
				BindingType.INSERT,
			].includes(binding.type) === false;
		});
	}

	private getInsertBindings(): Binding[] {
		return this.bindings.filter(binding => {
			return [BindingType.INSERT,].includes(binding.type) === true;
		});
	}

	private getUpdateBindings(): Binding[] {
		return this.bindings.filter(binding => {
			return [BindingType.UPDATE,].includes(binding.type) === true;
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

	toSql(): string {
		let baseQuery      = [`SELECT * from ?? WHERE`];
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

		const selectBindings = this.getSelectBindings() || [];
		if (this.isSelectQuery() || this.isUpdateQuery()) {

			// if we're doing an update query with a where clause, we need to append where.
			// for example, imagine the following:
			// UPDATE users SET username = 'sam' where username = 'sammeh';
			// At our current point, this query will be in the following stage:
			// UPDATE users SET username = 'sam'
			// We'll append 'WHERE' and then add the select bindings.
			if (this.isUpdateQuery()) {
				baseQuery.push(`WHERE`);
			}

			for (let binding of this.getSelectBindings()) {
				baseQuery.push(`?? ${binding.type} ?`);

				parts.push(binding.key);
				parts.push(binding.value);
			}

			if (this.limit && !this.isUpdateQuery()) {
				baseQuery.push(`LIMIT ?`);
				parts.push(this.limit);
			}
		}

		const sql = baseQuery.join(' ');

		const query = mysql.format(sql, parts);

		console.log(query);

		return query;
	}

	toQueryData(): mysql.QueryOptions {
		return {
			sql    : this.toSql(),
			values : this.bindings.map(b => b.value)
		};
	}
}
