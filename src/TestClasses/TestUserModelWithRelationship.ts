import {HasMany, HasOne, Model as ModelDefinition, Property} from "../Model/Decorators/Model";
import {Model} from "../Model/Model";
import {CastType, ModelCastRegistrations} from "../Model/Types";
import {TestBookModel} from "./TestBookModel";

@ModelDefinition
export class TestUserModelWithRelationship extends Model<TestUserModelWithRelationship> {

	public tableName: string = 'test_user_models';

	public casts: ModelCastRegistrations = {
		is_admin : CastType.BOOL
	};

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

	@HasMany(TestBookModel, 'user_id', 'id')
	books() {
		return this.hasMany(TestBookModel);
	}

	@HasOne(TestBookModel, 'user_id', 'id')
	book() {
		return this.hasOne(TestBookModel);
	}

}
