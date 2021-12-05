import {Model as ModelDefinition, Property} from "../Model/Decorators/Model";
import {Model} from "../Model/Model";
import {CastType, ModelCastRegistrations} from "../Model/Types";

@ModelDefinition
export class TestUserModel extends Model<TestUserModel> {

	public casts: ModelCastRegistrations = {
		is_admin : CastType.BOOL
	};

	@Property
	id: number;

	@Property
	username: string;

	@Property
	is_admin: boolean | number;

}
