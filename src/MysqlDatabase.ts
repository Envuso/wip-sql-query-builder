import mysql, {Connection, ConnectionConfig} from 'promise-mysql';
import {MetaDataStore, MetaStore} from "./MetaData/MetaDataStore";
import {ModelMetaData} from "./MetaData/ModelMetaData";

export class MysqlDatabase {

	public static config: ConnectionConfig = null;

	public static connection: Connection = null;

	public static async connect(config: ConnectionConfig) {
		this.config = config;

		this.connection = await mysql.createConnection(this.config);

		await MetaDataStore.loadModels(`src/TestClasses/**/*.{js,ts}`);
		await MetaDataStore.loadModels(`src/Migrations/Runner/**/*.{js,ts}`);

		return this.connection;
	}

	public static getDatabaseName(): string {
		return this.config.database;
	}

	public static disconnect(): void {
		this.connection.destroy();
	}
}
