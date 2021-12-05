import "reflect-metadata";
import {MigrationRunner} from "../src/Migrations/Runner/MigrationRunner";
import {Table} from "../src/Migrations/Table";
import {MysqlDatabase} from "../src/MysqlDatabase";

const runner = new MigrationRunner();

jest.setTimeout(70000);

describe('Migrations', function () {

	beforeAll(async () => {
		await MysqlDatabase.connect({
			database : 'local_sql_query_builder',
			user     : 'root',
			password : 'secret'
		});
		Table.setConnection(MysqlDatabase.connection, MysqlDatabase.getDatabaseName());
		await runner.boot({
			paths : [
				'src/TestClasses/Migrations/**/*.{ts,js}'
			]
		});
	});

	afterAll(async () => {
		MysqlDatabase.disconnect();
	});

	test('table exists', async () => {
		const result = await Table.hasTable('test_user_models');

		expect(result).toEqual(true);

		const failingResult = await Table.hasTable('fjsdhfksdhkfhsdhfsdh');

		expect(failingResult).toEqual(false);
	});

	test('getting table columns', async () => {

		const result = await Table.getColumns('test_user_models');

		expect(result).toContain('id');
		expect(result).toContain('is_admin');
		expect(result).toContain('username');
		expect(result).toContain('created_at');
		expect(result).toContain('updated_at');
	});

	test('getting table column types', async () => {

		const result = await Table.getColumnTypes('test_user_models');

		expect(result[0]).toHaveProperty('field', 'id');
		expect(result[0]).toHaveProperty('type', 'int');

	});

	test('getting all tables', async () => {

		const result = await Table.getAllTables();

		expect(result).toContain('test_user_models');
	});


});

describe('Migrations up/down', function () {

	beforeAll(async () => {
		await MysqlDatabase.connect({
			database : 'local_sql_query_builder',
			user     : 'root',
			password : 'secret'
		});
		Table.setConnection(MysqlDatabase.connection, MysqlDatabase.getDatabaseName());
		await runner.boot({
			paths : [
				'src/TestClasses/Migrations/**/*.{ts,js}'
			]
		});
	});

	afterAll(async () => {
		MysqlDatabase.disconnect();
	});

	test('running migration up method', async () => {
		await runner.runUp();
	});

	test('running migration down method', async () => {
		await runner.runDown();
	});

	test('running migration rollback', async () => {
		await runner.rollback();
	});


});
