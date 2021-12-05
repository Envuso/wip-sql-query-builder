import {HasMany, HasOne, Model as ModelDefinition, Property} from "../Model/Decorators/Model";
import {Model} from "../Model/Model";
import {CastType} from "../Model/Types";
import {TestBookModel} from "./TestBookModel";

@ModelDefinition
export class TestUserModelWithRelationship extends Model<TestUserModelWithRelationship> {

	boot() {
		this.setTable('test_user_models');
		this.setCasts({
			is_admin : CastType.BOOL
		});
	}

	@Property
	id: number;

	@Property
	username: string;

	@Property
	is_admin: boolean | number;

	@Property
	created_at: Date;

	@Property
	updated_at: Date;

	@HasMany('TestBookModel', 'user_id', 'id')
	books() {
		return this.hasMany(TestBookModel);
	}

	@HasOne('TestBookModel', 'user_id', 'id')
	book() {
		return this.hasOne(TestBookModel);
	}

}
