import "reflect-metadata";
import {MysqlDatabase} from "../src/MysqlDatabase";
import {TestUserModel} from "./TestClasses/TestUserModel";
import {MetaStore} from "../src/MetaDataStore";
import {TestUserModelWithHooks} from "./TestClasses/TestUserModelWithHooks";


describe('Models', function () {

	beforeAll(async () => {
		const connection = await MysqlDatabase.connect({
			database : 'local_sql_query_builder',
			user     : 'root',
			password : 'secret'
		});
	})

	test('model is registered', () => {

		const r             = MetaStore.getModels();
		const testUserModel = MetaStore.getModel('TestUserModel');
		debugger

	});

	test('basic query', async () => {
		const t       = new TestUserModel();

		const many    = await t.query().where('username', 'sam').get();
		const manyTwo = await t.query().where('is_admin', 0).get();
		const one     = await t.query().where('username', 'sam').first();

		debugger
	});

	test('insert query', async () => {
		const t   = new TestUserModel();

		const res = await t.query()
			.insert({
				username : 'yaaa',
			});

		debugger
	});

	test('update query', async () => {

		const t   = new TestUserModel();

		const res = await t.query()
			.where('username', 'Sam')
			.update({
				is_admin : 1,
			});

		debugger

	});


	test('model hooks', async () => {

		const t   = new TestUserModelWithHooks();

		const res = await t.query()
			.where('username', 'Sam')
			.update({
				is_admin : 1,
			});

		debugger

	});

});
