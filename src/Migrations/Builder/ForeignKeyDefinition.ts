export class ForeignKeyDefinition {

	constructor(
		public name: string,
		public localKey: string,
		public foreignKey: string,
		public localTable: string,
		public foreignTable: string
	) {

	}

}
