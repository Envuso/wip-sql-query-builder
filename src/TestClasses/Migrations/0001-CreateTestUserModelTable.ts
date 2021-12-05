import {Migration} from "../../Migrations/Migration";
import {Table} from "../../Migrations/Table";
import {TestUserModel} from "../TestUserModel";

export class CreateTestUserModelTable extends Migration {

	public up() {
		Table.create(TestUserModel, builder => {
			builder.increments('id');
			builder.string('username');
			builder.timestamps();
		});
	}

	public down() {
		Table.dropIfExists(TestUserModel);
	}
}
