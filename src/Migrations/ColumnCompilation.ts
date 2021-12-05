import type {ColumnDefinition} from "./Builder/ColumnDefinition";
import {MysqlColumnTypeCompilationMethod, MysqlColumnTypes} from "./Types";

export class ColumnCompilation {

	public static defaultLength: number = 255;

	public static modifierNullable(column: ColumnDefinition) {
		return column.isNullable()
			? `null`
			: `not null`;
	}

	public static modifierPrimaryKey(column: ColumnDefinition) {
		return "auto_increment primary key";
	}

	//region Date types

	public static typeDate(column: ColumnDefinition) {
		return "date";
	}

	public static typeTime(column: ColumnDefinition) {
		return column.getPrecision()
			? `time(${column.getPrecision()})`
			: `time`;
	}

	public static typeDatetime(column: ColumnDefinition) {
		const type = column.getPrecision()
			? `datetime(${column.getPrecision()})`
			: `datetime`;

		return column.useCurrentTimestamp()
			? `${type} default CURRENT_TIMESTAMP`
			: type;
	}

	public static typeTimestamp(column: ColumnDefinition) {
		const type = column.getPrecision()
			? `timestamp(${column.getPrecision()})`
			: `timestamp`;

		const defaultCurrent = column.getPrecision()
			? `CURRENT_TIMESTAMP(${column.getPrecision()})`
			: 'CURRENT_TIMESTAMP';

		return column.useCurrentTimestamp()
			? `${type} default ${defaultCurrent}`
			: type;
	}

	public static typeYear(column: ColumnDefinition) {
		return "year";
	}

	//endregion Date types


	//region Numeric types

	public static typeTinyint(column: ColumnDefinition) {
		return 'tinyint';
	}

	public static typeSmallint(column: ColumnDefinition) {
		return 'smallint';
	}

	public static typeMediumint(column: ColumnDefinition) {
		return 'mediumint';
	}

	public static typeInt(column: ColumnDefinition) {
		return 'int';
	}

	public static typeBigint(column: ColumnDefinition) {
		return 'bigint';
	}

	public static typeDecimal(column: ColumnDefinition) {
		return 'decimal';
	}

	public static typeFloat(column: ColumnDefinition) {
		return 'float';
	}

	public static typeDouble(column: ColumnDefinition) {
		return 'double';
	}

	public static typeBit(column: ColumnDefinition) {
		return 'bit';
	}

	//endregion

	public static typeChar(column: ColumnDefinition) {
		return `char(${column.getLength() ?? this.defaultLength})`;
	}

	public static typeVarchar(column: ColumnDefinition) {
		return `varchar(${column.getLength() ?? this.defaultLength})`;
	}

	public static typeText(column: ColumnDefinition) {
		return `text`;
	}

	public static typeMediumtext(column: ColumnDefinition) {
		return `mediumtext`;
	}

	public static typeLongtext(column: ColumnDefinition) {
		return `longtext`;
	}

	public static getTypeFor(column: ColumnDefinition): string | null {
		const method = MysqlColumnTypeCompilationMethod[column.getType()];

		if (!method) {
			console.error(`No mapping defined for type(${column.getType()}) in MysqlColumnTypeCompilationMethod`);
			return null;
		}

		const typeMethod = this[method];

		if (!typeMethod) {
			console.error(`No compile method defined for type(${column.getType()}) in ColumnCompilation : ${method}`);
			return null;
		}

		return typeMethod(column);
	}
}
