import {HasOne, Model as ModelDefinition, Property} from "../Model/Decorators/Model";
import {Model} from "../Model/Model";
import {TestUserModelWithRelationship} from "./TestUserModelWithRelationship";

@ModelDefinition
export class TestBookModel extends Model<TestBookModel> {

	@Property
	id: number;

	@Property
	user_id: number;

	@Property
	title: string;

	@Property
	created_at: Date;

	@Property
	updated_at: Date;

	@HasOne('TestUserModelWithRelationship', 'id', 'user_id')
	user() {
		return this.hasOne(TestUserModelWithRelationship);
	}


}
