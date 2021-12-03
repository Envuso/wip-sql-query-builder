import {Model as ModelDefinition, Property} from "../../src/Model/Decorators/Model";
import {Model} from "../../src/Model/Model";
import {CastType} from "../../src/Model/ModelAttributes";
import type {ModelCastRegistrations} from "../../src/Model/ModelAttributes";

@ModelDefinition
export class TestUserModel extends Model<TestUserModel> {

	public casts: ModelCastRegistrations = {
		is_admin : CastType.BOOL
	};

	@Property
	username: string;

	@Property
	is_admin: boolean | number;

}
