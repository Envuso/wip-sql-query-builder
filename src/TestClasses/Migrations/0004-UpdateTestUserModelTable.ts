import {Migration} from "../../Migrations/Migration";
import {Table} from "../../Migrations/Table";
import {TestUserModel} from "../TestUserModel";

export class CreateTestUserModelTable extends Migration {

	public up() {
		Table.update(TestUserModel, builder => {
			//			builder.renameColumn('temp_test_property', 'renamed_temp_test_property');
		});
	}

	public down() {
		Table.update(TestUserModel, builder => {
			//			builder.renameColumn('renamed_temp_test_property', 'temp_test_property');
		});
	}
}
