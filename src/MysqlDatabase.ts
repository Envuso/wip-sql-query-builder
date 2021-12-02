import mysql, {Connection, ConnectionConfig} from 'promise-mysql';

export class MysqlDatabase {

	public static connection: Connection = null;

	public static async connect(config: ConnectionConfig) {
		this.connection = await mysql.createConnection(config);

		return this.connection;
	}

}
