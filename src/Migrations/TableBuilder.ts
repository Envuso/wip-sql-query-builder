import mysql from "promise-mysql";
import {MetaStore} from "../MetaData/MetaDataStore";
import type {Model} from "../Model/Model";
import type {ModelStatic} from "../Model/Types";
import {ForeignKeyDefinition} from "./Builder/ForeignKeyDefinition";
import {ColumnCompilation} from "./ColumnCompilation";
import {ColumnDefinition} from "./Builder/ColumnDefinition";
import {Table} from "./Table";
import {MysqlColumnTypes, TableModelType} from "./Types";

export class TableBuilder<T extends Model<any>> {

	private model: TableModelType<T> = null;

	private tableName: string = null;

	private commands: Map<string, any> = new Map();

	private columns: Map<string, ColumnDefinition> = new Map();

	private columnsToDrop: Map<string, { name: string, ifExists: boolean }> = new Map();

	constructor(model: TableModelType<T>) {
		this.model     = model;
		this.tableName = new model().getTable();
	}

	create() {
		this.commands.set('create', true);
	}

	update() {
		this.commands.set('update', true);
	}

	drop() {
		this.commands.set('drop', true);
	}

	dropIfExists() {
		this.commands.set('dropIfExists', true);
	}

	integer(name: string, autoIncrements: boolean = false, unsigned: boolean = false): ColumnDefinition {
		return this.addColumn(name, MysqlColumnTypes.INT, {
			autoIncrements,
			unsigned,
		});
	}

	bigInteger(name: string, autoIncrements: boolean = false, unsigned: boolean = false): ColumnDefinition {
		return this.addColumn(name, MysqlColumnTypes.BIGINT, {
			autoIncrements,
			unsigned,
		});
	}

	unsignedInteger(name: string, autoIncrements: boolean = false): ColumnDefinition {
		return this.integer(name, autoIncrements, true);
	}

	unsignedBigInteger(name: string, autoIncrements: boolean = false): ColumnDefinition {
		return this.bigInteger(name, autoIncrements, true);
	}

	/**
	 * This will set the specified column as the primary key & add auto
	 * increment + set the column as unsigned
	 *
	 * @param {string} name
	 * @returns {ColumnDefinition}
	 */
	increments(name: string): ColumnDefinition {
		return this.unsignedBigInteger(name, true);
	}

	/**
	 * This will set the specified column as the primary key & add auto
	 * increment + set the column as unsigned
	 *
	 * @param {string} name
	 * @returns {ColumnDefinition}
	 */
	primaryKey(name: string): ColumnDefinition {
		return this.increments(name);
	}

	/**
	 * Change the name of a column in your table
	 *
	 * @param {string} from
	 * @param {string} to
	 * @returns {TableBuilder}
	 */
	renameColumn(from: string, to: string): TableBuilder<T> {
		this.commands.set('renameColumn', {from, to});

		return this;
	}

	boolean(name: string): ColumnDefinition {
		return this.addColumn(name, MysqlColumnTypes.TINYINT, {});
	}

	tinyInt(name: string): ColumnDefinition {
		return this.addColumn(name, MysqlColumnTypes.TINYINT, {});
	}

	string(name: string, length: number = 255): ColumnDefinition {
		return this.addColumn(name, MysqlColumnTypes.VARCHAR, {length});
	}

	char(name: string, length: number = 255): ColumnDefinition {
		return this.addColumn(name, MysqlColumnTypes.CHAR, {length});
	}

	timestamp(name: string, precision: number = 0): ColumnDefinition {
		return this.addColumn(name, MysqlColumnTypes.TIMESTAMP, {precision});
	}

	timestamps(precision: number = 0) {
		this.timestamp('created_at', precision);
		this.timestamp('updated_at', precision);
	}

	public belongsTo<T extends Model<any>>(model: new (attributes?: Partial<T>) => T, foreignKey: string): void {
		const relatedModelInst = new model();
		const modelMeta        = MetaStore.getModelViaName(this.model.name);

		if (!modelMeta.isRelatedModel(model)) {
			console.error(`You're trying to define a belongsTo relation on your migration... but you haven't defined it on your model. Please define it there also.`);
			return;
		}

		const relation = modelMeta.getRelationFromModel(model);

		this.addColumn(relation.localKey, MysqlColumnTypes.BIGINT).unsigned();
		this.addForeignKey(relation.localKey, relatedModelInst.getTable(), relation.foreignKey);
	}

	index(columns: string[], name: string);
	index(columns: string[]);
	index(columns: string[], name?: string) {
		this.addIndexCommand(name, columns);

		return this;
	}

	private addIndexCommand(name: string, columns: string[], unique: boolean = false) {
		const indexDefinition = {
			name : (name ?? null),
			columns,
			unique,
		};

		const indexes = this.commands.get('addIndexes') || [];

		indexes.push(indexDefinition);

		this.commands.set('addIndexes', indexes);
	}

	private addForeignKeyCommand(foreignKey: ForeignKeyDefinition) {
		const keys = this.commands.get('addForeignKeys') || [];

		keys.push(foreignKey);

		this.commands.set('addForeignKeys', keys);
	}

	/**
	 * If the column doesn't exist, SQL will probably throw an error
	 *
	 * If you want some safety, use {@see dropColumnIfExists}
	 *
	 * @param {string} name
	 * @returns {this}
	 */
	dropColumn(name: string) {
		this.columnsToDrop.set(name, {name, ifExists : true});

		return this;
	}

	/**
	 * We'll check if the column exists before we attempt to drop it.
	 * Any that don't exist on the table, will be removed from the final query
	 *
	 * @param {string} name
	 * @returns {this}
	 */
	dropColumnIfExists(name: string) {
		this.columnsToDrop.set(name, {name, ifExists : true});

		return this;
	}

	addColumn(name: string, type: MysqlColumnTypes, data: any = {}): ColumnDefinition {
		const definition = new ColumnDefinition(
			name, type, data, this.tableName
		);

		this.columns.set(name, definition);

		return definition;
	}

	addForeignKey(localKey: string, table: string, foreignKey: string) {
		const fkName = [table, localKey, 'foreign',].join('_').toLowerCase();

		this.addForeignKeyCommand(
			new ForeignKeyDefinition(
				fkName, localKey, foreignKey, this.tableName, table,
			)
		);
	}

	public async run() {

		const commands = await this.compileCommands();

		for (let command of commands) {
			console.log('Running command: ', command);

			const result = await Table.getConnection().query(command);

			console.log('Result for: ', {
				command,
				result
			});
		}

	}

	private async compileCommands(): Promise<string[]> {
		const commandQueries = [];

		const commands    = Object.fromEntries(this.commands.entries());
		const commandKeys = Object.keys(commands);

		this.columns.forEach(value => {
			if (value.hasAnyIndexes()) {
				value.getAllIndexes().forEach(index => {
					this.addIndexCommand(index.name, [index.column], index.type === 'unique');
				});
			}
		});

		for (let key of commandKeys) {
			const command = commands[key];

			let createUpdateQuery = null;

			switch (key) {
				case "create":
					createUpdateQuery = await this.compileCreateQuery();
					if (createUpdateQuery) {
						commandQueries.push(createUpdateQuery);
					}
					break;
				case "update":
					createUpdateQuery = await this.compileUpdateQuery();
					if (createUpdateQuery) {
						commandQueries.push(createUpdateQuery);
					}
					break;
				case "drop":
				case "dropIfExists":
					commandQueries.push(this.compileDropTableQuery(key === 'dropIfExists'));
					break;
				case "renameColumn":
					commandQueries.push(this.compileRenameColumnQuery(command));
					break;
				case "addIndexes":
					commandQueries.push(...this.compileAddIndexesQuery(command));
					break;
				case "addForeignKeys":
					commandQueries.push(...this.compileAddForeignKeysQuery(command));
					break;
			}
		}

		if (this.columnsToDrop.size) {
			commandQueries.push(await this.compileDropColumnsQuery());
		}

		return commandQueries;
	}

	private async compileColumnsSection(compilingFor: 'CREATE_TABLE' | 'ADD_COLUMN' | 'MODIFY_COLUMN') {
		if (!this.columns.size) {
			return {sql : null, parts : null};
		}

		const existingColumns = await Table.getColumns(this.tableName);

		const parts   = [];
		const columns = [...this.columns.values()];

		const columnQueryParts = [];
		for (let column of columns) {

			if (compilingFor === 'ADD_COLUMN') {
				if (existingColumns.some(c => c === column.getName()) && !column.change()) {
					console.warn(`Skipping column on migration ${column.getName()}. It already exists in the table, we can't add it. If you wanted to change this column. call .change()`);
					console.warn(`For example: builder.string('username').change(), builder.string('username').rename('some_new_name').change()`);

					continue;
				}
			}

			let columnPrefix = '';
			if (compilingFor === 'ADD_COLUMN') {
				columnPrefix = 'add';
			}

			let columnQuery = [`${columnPrefix} ?? ${column.compileType()}`.trimLeft()];

			parts.push(column.getName());

			if (column.hasDefault()) {
				columnQuery.push(`DEFAULT ${column.getDefault()}`);
			}

			switch (true) {
				case column.isAutoIncrementing():
					columnQuery.push(ColumnCompilation.modifierPrimaryKey(column));
					break;
				default:
					columnQuery.push(ColumnCompilation.modifierNullable(column));
					break;
			}

			columnQueryParts.push(columnQuery.join(' '));
		}

		const sql = columnQueryParts.join(', ');

		if (compilingFor !== 'CREATE_TABLE') {
			return {sql, parts};
		}

		return {
			sql : `(${sql})`,
			parts,
		};
	}

	private async compileCreateQuery() {
		let query = [`CREATE TABLE IF NOT EXISTS ??`];
		let parts = [this.tableName];

		const columnsDefinition = await this.compileColumnsSection('CREATE_TABLE');

		if (!columnsDefinition.sql) {
			return null;
		}

		query.push(columnsDefinition.sql);
		parts.push(...columnsDefinition.parts);

		const sql = mysql.format(query.join(' '), parts);

		console.log(`compileCreateQuery sql: `, sql, parts);

		return sql;
	}

	private async compileUpdateQuery() {

		let query = [`ALTER TABLE ??`];
		let parts = [this.tableName];

		const columnsDefinition = await this.compileColumnsSection('ADD_COLUMN');

		if (!columnsDefinition.sql) {
			return null;
		}

		query.push(columnsDefinition.sql);
		parts.push(...columnsDefinition.parts);

		const sql = mysql.format(query.join(' '), parts);

		return sql;
	}

	private async compileDropColumnsQuery(): Promise<any> {
		let existingColumns: string[] = [];

		const columns = [...this.columnsToDrop.values()];

		if (columns.some(c => c.ifExists)) {
			existingColumns = await Table.getColumns(this.tableName);
		}

		let query = [`ALTER TABLE ??`];
		let parts = [this.tableName];

		const dropQuerySections = [];
		for (let column of columns) {

			if (column.ifExists && !existingColumns.includes(column.name)) {
				console.info(`Dropping of column: ${column.name} was skipped because it doesn't exist on the table.`);
				continue;
			}

			dropQuerySections.push(`DROP COLUMN ??`);
			parts.push(column.name);
		}

		query.push(dropQuerySections.join(', '));

		return mysql.format(query.join(' '), parts);
	}

	private compileDropTableQuery(ifExists: boolean): string {
		let query = [`DROP TABLE`];
		let parts = [this.tableName];

		if (ifExists) {
			query.push(`IF EXISTS`);
		}

		query.push(`??`);


		return mysql.format(query.join(' '), parts);
	}

	private compileRenameColumnQuery({from, to}: { from: string, to: string }): string {
		return mysql.format(
			`ALTER TABLE ?? RENAME COLUMN ?? TO ??`,
			[this.tableName, from, to]
		);
	}

	private compileAddIndexesQuery(indexes: { name: string, columns: string[], unique: boolean }[]): string[] {
		return indexes.map(index => {
			return mysql.format(
				[`create`, (index.unique ? 'UNIQUE' : ''), `index ?? on ?? (??)`].join(' '),
				[index.name, this.tableName, [index.columns]]
			);
		});
	}

	private compileAddForeignKeysQuery(foreignKeys: ForeignKeyDefinition[]): any[] {
		return foreignKeys.map(foreignKey => {
			return mysql.format(
				`ALTER TABLE ?? ADD CONSTRAINT ?? FOREIGN KEY (??) REFERENCES ??(??)`,
				[this.tableName, foreignKey.name, foreignKey.localKey, foreignKey.foreignTable, foreignKey.foreignKey]
			);
		});
	}
}
