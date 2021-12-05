import {Migration} from "../../Migrations/Migration";
import {Table} from "../../Migrations/Table";
import {TestUserModel} from "../TestUserModel";

export class CreateTestUserModelTable extends Migration {

	public up() {
		Table.update(TestUserModel, builder => {
			builder.string('unique_index').unique();
			builder.string('indexed_col').index();
			builder.index(['unique_index', 'indexed_col'], 'custom_index');
		});
	}

	public down() {
		Table.update(TestUserModel, builder => {
			builder.dropColumnIfExists('unique_index');
			builder.dropColumnIfExists('indexed_col');
		});
	}
}
