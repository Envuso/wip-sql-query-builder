import {Model as ModelDefinition, Property} from "../../src/Model/Decorators/Model";
import {Model} from "../../src/Model/Model";

@ModelDefinition
export class TestUserModelWithHooks extends Model<TestUserModelWithHooks> {

	public tableName: string = 'testusermodel';

	@Property
	username: string;

	@Property
	is_admin: boolean | number;

	@Property
	created_at: Date;

	@Property
	updated_at: Date;

	beforeCreate(model: Partial<TestUserModelWithHooks>) {
		console.log('hi from before create', 'Model data being created: ', model);

		model.created_at = new Date();

		return model;
	}

	afterCreate(model: Partial<TestUserModelWithHooks>) {
		console.log('hi from after create', model);

		return model;
	}
	beforeUpdate(model: Partial<TestUserModelWithHooks>) {
		console.log('hi from before update', 'Model data being updated: ', model);

		model.updated_at = new Date();

		return model;
	}

	afterUpdate(model: Partial<TestUserModelWithHooks>) {
		console.log('hi from after update', model);

		return model;
	}
}
