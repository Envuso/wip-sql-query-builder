import mysql from "promise-mysql";

export class TableHelpers {

	public static compileTableExists(databaseName: string, tableName: string) {
		return mysql.format(
			"select * from information_schema.tables where table_schema = ? and table_name = ? and table_type = 'BASE TABLE'",
			[databaseName, tableName]
		);
	}

	public static compileColumnListing(databaseName: string, tableName: string) {
		return mysql.format(
			"select column_name as `column_name` from information_schema.columns where table_schema = ? and table_name = ?",
			[databaseName, tableName]
		);
	}

	public static compileColumnTypeListing(databaseName: string, tableName: string) {
		return mysql.format(
			"show fields from ??.??",
			[databaseName, tableName]
		);
	}

	public static compileGetAllTables() {
		return mysql.format(
			"SHOW FULL TABLES WHERE table_type = 'BASE TABLE'",
			[]
		);
	}

}
