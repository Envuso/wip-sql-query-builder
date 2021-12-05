import {Migration} from "../../Migrations/Migration";
import {Table} from "../../Migrations/Table";
import {TestUserModel} from "../TestUserModel";

export class CreateTestUserModelTable extends Migration {

	public up() {
		Table.update(TestUserModel, builder => {
			builder.boolean('temp_test_property').default(false);
		});
	}

	public down() {
		Table.update(TestUserModel, builder => {
			builder.dropColumnIfExists('temp_test_property');
		});
	}
}

