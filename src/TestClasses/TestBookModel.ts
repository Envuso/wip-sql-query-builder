import {Model as ModelDefinition, Property} from "../Model/Decorators/Model";
import {Model} from "../Model/Model";
import {CastType, ModelAttributesType, ModelCastRegistrations} from "../Model/Types";

@ModelDefinition
export class TestBookModel extends Model<TestBookModel> {

	@Property
	id: number;

	@Property
	user_id: number;

	@Property
	title: string;

}
