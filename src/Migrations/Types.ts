import type {Model} from "../Model/Model";
import type {Migration} from "./Migration";

export type TableModelType<T extends Model<any>> = new (attributes?: Partial<T>) => T;

export type ColumnTypeData = {
	Default: any,
	Extra: string,
	Field: string,
	Key: string,
	Null: string,
	Type: string,
}

export type FormattedColumnTypeData = {
	default: any,
	extra: string,
	field: string,
	key: string,
	null: string,
	type: MysqlColumnTypes,
}

export enum MysqlColumnTypes {
	// Numeric types:
	TINYINT            = 'tinyint',
	SMALLINT           = 'smallint',
	MEDIUMINT          = 'mediumint',
	INT                = 'int',
	BIGINT             = 'bigint',
	DECIMAL            = 'decimal',
	FLOAT              = 'float',
	DOUBLE             = 'double',
	BIT                = 'bit',

	// String types:
	CHAR               = 'char',
	VARCHAR            = 'varchar',
	BINARY             = 'binary',
	VARBINARY          = 'varbinary',
	TINYBLOB           = 'tinyblob',
	BLOB               = 'blob',
	MEDIUMBLOB         = 'mediumblob',
	LONGBLOB           = 'longblob',
	TINYTEXT           = 'tinytext',
	TEXT               = 'text',
	MEDIUMTEXT         = 'mediumtext',
	LONGTEXT           = 'longtext',
	ENUM               = 'enum',
	SET                = 'set',

	// Date types:
	DATE               = 'date',
	TIME               = 'time',
	DATETIME           = 'datetime',
	TIMESTAMP          = 'timestamp',
	YEAR               = 'year',

	// Spatial types:
	GEOMETRY           = 'geometry',
	POINT              = 'point',
	LINESTRING         = 'linestring',
	POLYGON            = 'polygon',
	GEOMETRYCOLLECTION = 'geometrycollection',
	MULTILINESTRING    = 'multilinestring',
	MULTIPOINT         = 'multipoint',
	MULTIPOLYGON       = 'multipolygon',

	// Json type:
	JSON               = 'json',

}

export const MysqlColumnTypeMapper = {
	// Numeric types:
	tinyint   : MysqlColumnTypes.TINYINT,
	smallint  : MysqlColumnTypes.SMALLINT,
	mediumint : MysqlColumnTypes.MEDIUMINT,
	int       : MysqlColumnTypes.INT,
	bigint    : MysqlColumnTypes.BIGINT,
	decimal   : MysqlColumnTypes.DECIMAL,
	float     : MysqlColumnTypes.FLOAT,
	double    : MysqlColumnTypes.DOUBLE,
	bit       : MysqlColumnTypes.BIT,

	// String types:
	char       : MysqlColumnTypes.CHAR,
	varchar    : MysqlColumnTypes.VARCHAR,
	binary     : MysqlColumnTypes.BINARY,
	varbinary  : MysqlColumnTypes.VARBINARY,
	tinyblob   : MysqlColumnTypes.TINYBLOB,
	blob       : MysqlColumnTypes.BLOB,
	mediumblob : MysqlColumnTypes.MEDIUMBLOB,
	longblob   : MysqlColumnTypes.LONGBLOB,
	tinytext   : MysqlColumnTypes.TINYTEXT,
	text       : MysqlColumnTypes.TEXT,
	mediumtext : MysqlColumnTypes.MEDIUMTEXT,
	longtext   : MysqlColumnTypes.LONGTEXT,
	enum       : MysqlColumnTypes.ENUM,
	set        : MysqlColumnTypes.SET,

	// Date types:
	date      : MysqlColumnTypes.DATE,
	time      : MysqlColumnTypes.TIME,
	datetime  : MysqlColumnTypes.DATETIME,
	timestamp : MysqlColumnTypes.TIMESTAMP,
	year      : MysqlColumnTypes.YEAR,

	// Spatial types:
	geometry           : MysqlColumnTypes.GEOMETRY,
	point              : MysqlColumnTypes.POINT,
	linestring         : MysqlColumnTypes.LINESTRING,
	polygon            : MysqlColumnTypes.POLYGON,
	geometrycollection : MysqlColumnTypes.GEOMETRYCOLLECTION,
	multilinestring    : MysqlColumnTypes.MULTILINESTRING,
	multipoint         : MysqlColumnTypes.MULTIPOINT,
	multipolygon       : MysqlColumnTypes.MULTIPOLYGON,

	// Json type:
	json : MysqlColumnTypes.JSON,
};

export const MysqlColumnTypeCompilationMethod = {
	// Numeric types:
	[MysqlColumnTypes.TINYINT]   : 'typeTinyint',
	[MysqlColumnTypes.SMALLINT]  : 'typeSmallint',
	[MysqlColumnTypes.MEDIUMINT] : 'typeMediumint',
	[MysqlColumnTypes.INT]       : 'typeInt',
	[MysqlColumnTypes.BIGINT]    : 'typeBigint',
	[MysqlColumnTypes.DECIMAL]   : 'typeDecimal',
	[MysqlColumnTypes.FLOAT]     : 'typeFloat',
	[MysqlColumnTypes.DOUBLE]    : 'typeDouble',
	[MysqlColumnTypes.BIT]       : 'typeBit',

	// String types:
	[MysqlColumnTypes.CHAR]       : 'typeChar', // ☑️
	[MysqlColumnTypes.VARCHAR]    : 'typeVarchar', // ☑️
	[MysqlColumnTypes.BINARY]     : 'typeBinary',
	[MysqlColumnTypes.VARBINARY]  : 'typeVarbinary',
	[MysqlColumnTypes.TINYBLOB]   : 'typeTinyblob',
	[MysqlColumnTypes.BLOB]       : 'typeBlob',
	[MysqlColumnTypes.MEDIUMBLOB] : 'typeMediumblob',
	[MysqlColumnTypes.LONGBLOB]   : 'typeLongblob',
	[MysqlColumnTypes.TINYTEXT]   : 'typeTinytext',
	[MysqlColumnTypes.TEXT]       : 'typeText',  // ☑️
	[MysqlColumnTypes.MEDIUMTEXT] : 'typeMediumtext', // ☑️
	[MysqlColumnTypes.LONGTEXT]   : 'typeLongtext', // ☑️
	[MysqlColumnTypes.ENUM]       : 'typeEnum',
	[MysqlColumnTypes.SET]        : 'typeSet',

	// Date types:
	[MysqlColumnTypes.DATE]      : 'typeDate',
	[MysqlColumnTypes.TIME]      : 'typeTime',
	[MysqlColumnTypes.DATETIME]  : 'typeDatetime',
	[MysqlColumnTypes.TIMESTAMP] : 'typeTimestamp',
	[MysqlColumnTypes.YEAR]      : 'typeYear',

	// Spatial types:
	[MysqlColumnTypes.GEOMETRY]           : 'typeGeometry',
	[MysqlColumnTypes.POINT]              : 'typePoint',
	[MysqlColumnTypes.LINESTRING]         : 'typeLinestring',
	[MysqlColumnTypes.POLYGON]            : 'typePolygon',
	[MysqlColumnTypes.GEOMETRYCOLLECTION] : 'typeGeometrycollection',
	[MysqlColumnTypes.MULTILINESTRING]    : 'typeMultilinestring',
	[MysqlColumnTypes.MULTIPOINT]         : 'typeMultipoint',
	[MysqlColumnTypes.MULTIPOLYGON]       : 'typeMultipolygon',

	// Json type:
	[MysqlColumnTypes.JSON] : 'typeJson',
};

export type MigrationRunnerBootOptions = {
	paths: string[];
};

export type ResolvedMigration = {
	migrationClass: (new () => Migration);
	file: string;
	fileName: string;
}
