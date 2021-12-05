import {Migration} from "../../Migrations/Migration";
import {Table} from "../../Migrations/Table";
import {TestBookModel} from "../TestBookModel";
import {TestUserModel} from "../TestUserModel";
import {TestUserModelWithRelationship} from "../TestUserModelWithRelationship";

export class CreateTestBooksModelTable extends Migration {

	public up() {
		Table.update(TestBookModel, builder => {
			builder.string('yeet');
		});
	}

	public down() {
		Table.update(TestBookModel, builder => {
			builder.dropColumnIfExists('yeet');
		});
	}
}
