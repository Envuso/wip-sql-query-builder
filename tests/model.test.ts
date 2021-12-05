import "reflect-metadata";
import {MysqlDatabase} from "../src/MysqlDatabase";
import {TestBookModel} from "../src/TestClasses/TestBookModel";
import {TestUserModel} from "../src/TestClasses/TestUserModel";
import {MetaStore} from "../src/MetaData/MetaDataStore";
import {TestUserModelWithHooks} from "../src/TestClasses/TestUserModelWithHooks";
import {TestUserModelWithRelationship} from "../src/TestClasses/TestUserModelWithRelationship";


describe('Models', function () {

	beforeAll(async () => {
		const connection = await MysqlDatabase.connect({
			database : 'local_sql_query_builder',
			user     : 'root',
			password : 'secret'
		});
	});

	test('model is registered', () => {

		const r             = MetaStore.getModels();
		const testUserModel = MetaStore.getModel(TestUserModel);
		debugger

	});

	test('basic query', async () => {
		const t = new TestUserModel();

		await t.query().insert({username : 'sam'});
		await t.query().insert({username : 'sam two', is_admin : 0});

		const many = await t.query()
			.where('username', 'sam')
			.orderBy('id', 'desc')
			.get();

		const manyTwo = await t.query()
			.where('is_admin', 0)
			.orderBy('id', 'desc')
			.get();

		expect(many[0]).toHaveProperty('username', 'sam');
		expect(manyTwo[0]).toHaveProperty('is_admin', false);

		const one = await t.query()
			.where('username', 'sam')
			.orderBy('id', 'desc')
			.first();

		expect(one).toHaveProperty('username', 'sam');
	});

	test('insert query', async () => {
		const t = new TestUserModelWithHooks();

		const res = await t.query().insert({
			username : 'yaaa',
			is_admin : true,
		});

		expect(res).toHaveProperty('username', 'yaaa');
		expect(res).toHaveProperty('is_admin', true);
		expect(res).toHaveProperty('id');
	});

	test('update query', async () => {

		const t = new TestUserModel();

		const insertedModel = await t.query().insert({
			username : 'fhsdjhfsdhfkjsdh',
			is_admin : false,
		});

		const updatedRes = await t.query()
			.where('username', insertedModel.username)
			.update({is_admin : 1,});

		const result = await t.query()
			.where('id', insertedModel.id)
			.orderBy('id', 'desc')
			.first();

		expect(result).toHaveProperty('username', 'fhsdjhfsdhfkjsdh');
		expect(result).toHaveProperty('is_admin', true);
	});

	test('model hooks', async () => {

		const t = new TestUserModelWithHooks();

		const res = await t.query()
			.where('username', 'Sam')
			.update({
				is_admin : 1,
			});

		debugger

	});

	test('relationships initialization', async () => {

		const t = new TestUserModelWithRelationship();

		const r = t.getRelationships();

		debugger

	});

	test('relationships eager loading', async () => {


		const user = await TestUserModel.query().insert({
			username : 'bruce',
			is_admin : true,
		});

		const bookOne = await TestBookModel.query().insert({
			user_id : user.id,
			title   : 'yeet'
		});
		const bookTwo = await TestBookModel.query().insert({
			user_id : user.id,
			title   : 'yeet two'
		});

		const result = await TestUserModelWithRelationship.query()
			.where('id', user.id)
//			.with('books')
//			.with('book')
			.first();

		const book  = result.book();
		const books = result.books();

		const bookId  = book.id;
		const bookIds = books.map(b => {
			return b.id;
		});

		debugger

	});

});
