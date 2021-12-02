import {Model as ModelDefinition, Property} from "../../src/Model/Decorators/Model";
import {Model} from "../../src/Model/Model";

@ModelDefinition
export class TestUserModel extends Model {

	@Property
	username: string;

	@Property
	is_admin: boolean|number;

}
