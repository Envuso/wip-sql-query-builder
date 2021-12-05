import type {Model} from "../Model";

export interface BaseRelationContract<Current extends Model<any>, Related extends Model<any>> {
	__get(target: BaseRelationContract<Current, Related>, property: string, receiver: any): any;

	__set(target: BaseRelationContract<Current, Related>, property: string, value: any, receiver: any): boolean;
}
