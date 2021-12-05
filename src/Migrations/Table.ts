import type {Connection} from "promise-mysql";
import {objectToCamel} from "ts-case-convert/lib/caseConvert";
import type {Model} from "../Model/Model";
import {TableBuilder} from "./TableBuilder";
import {TableHelpers} from "./TableHelpers";
import {FormattedColumnTypeData, MysqlColumnTypeMapper, MysqlColumnTypes, TableModelType} from "./Types";
import type {ColumnTypeData} from "./Types";


export class Table {

	private static connection: Connection = null;
	private static databaseName: string   = null;

	private static builder: TableBuilder<any> = null;

	public static getConnection(): Connection {
		return this.connection;
	}

	public static setConnection(connection: Connection, databaseName: string) {
		this.connection   = connection;
		this.databaseName = databaseName;
	}

	static async hasTable(tableName: string) {
		const result = await this.connection.query(
			TableHelpers.compileTableExists(this.databaseName, tableName)
		);

		return result.length > 0;
	}

	static async getColumns(tableName: string): Promise<string[]> {
		const result: { column_name: string }[] = await this.connection.query(
			TableHelpers.compileColumnListing(this.databaseName, tableName)
		);

		return result.map(row => row.column_name);
	}

	static async hasColumn(tableName: string, column: string): Promise<boolean> {
		return (await this.getColumns(tableName))
			.map(row => row.toLowerCase())
			.includes(column.toLowerCase());
	}

	static async hasColumns(tableName: string, columns: string[]): Promise<boolean> {
		const tableColumns = (await this.getColumns(tableName)).map(row => row.toLowerCase());

		for (let column of columns) {
			if (!tableColumns.includes(column.toLowerCase())) {
				return false;
			}
		}

		return true;
	}

	static async getColumnTypes(tableName: string): Promise<FormattedColumnTypeData[]> {
		const result: ColumnTypeData[] = await this.connection.query(
			TableHelpers.compileColumnTypeListing(this.databaseName, tableName)
		);

		return result.map(column => {
			const type = MysqlColumnTypeMapper[column.Type] ?? null;

			return {...objectToCamel(column), type : type};
		});
	}

	static async getColumnType(tableName: string, column: string): Promise<MysqlColumnTypes> {
		const types = await this.getColumnTypes(tableName);

		const columnTypeData = types.find(c => c.field === column);

		if (!columnTypeData) {
			return null;
		}

		return columnTypeData.type as MysqlColumnTypes;
	}

	static async getAllTables(): Promise<string[]> {
		const tables = await this.connection.query(TableHelpers.compileGetAllTables());

		return tables.map(result => {
			return Object.values(result)[0];
		});
	}

	static newBuilder<T extends Model<any>>(model: TableModelType<T>) {
		this.builder = new TableBuilder(model);

		return this.builder;
	}

	static getBuilder() {
		return this.builder ?? null;
	}

	static create<T extends Model<any>>(model: TableModelType<T>, handler: (builder: TableBuilder<T>) => void) {
		this.newBuilder(model).create();

		handler(this.builder);
	}

	static update<T extends Model<any>>(model: TableModelType<T>, handler: (builder: TableBuilder<T>) => void) {
		this.newBuilder(model).update();

		handler(this.builder);
	}

	static drop<T extends Model<any>>(model: TableModelType<T>, handler: (builder: TableBuilder<T>) => void) {
		this.newBuilder(model).drop();

		handler(this.builder);
	}

	public static dropIfExists<T extends Model<any>>(model: TableModelType<T>): void {
		this.newBuilder(model).dropIfExists();
	}
}
