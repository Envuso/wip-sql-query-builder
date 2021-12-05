import {Migration} from "../../Migrations/Migration";
import {Table} from "../../Migrations/Table";
import {TestBookModel} from "../TestBookModel";
import {TestUserModel} from "../TestUserModel";
import {TestUserModelWithRelationship} from "../TestUserModelWithRelationship";

export class CreateTestBooksModelTable extends Migration {

	public up() {
		Table.create(TestBookModel, builder => {
			builder.increments('id');

			builder.string('title').nullable();

			builder.belongsTo(TestUserModelWithRelationship, 'user_id');

			builder.timestamps();
		});
	}

	public down() {
		Table.dropIfExists(TestBookModel);
	}
}
