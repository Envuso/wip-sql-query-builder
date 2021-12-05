import {Model as ModelDefinition, Property} from "../../Model/Decorators/Model";
import {Model} from "../../Model/Model";

@ModelDefinition
export class MigrationModel extends Model<MigrationModel> {
	@Property
	id: number;

	@Property
	migration: string;

	@Property
	batch: number;
}
