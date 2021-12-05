import {MysqlDatabase} from "../../MysqlDatabase";
import {Table} from "../Table";
import type {ResolvedMigration} from "../Types";
import {MigrationModel} from "./MigrationModel";

export class MigrationRepository {

	public async ensureMigrationTableExists() {

		const tableName = new MigrationModel().getTable();

		if (await Table.hasTable(tableName)) {
			return;
		}

		const result = await Table.getConnection().query(`CREATE TABLE ${tableName} ( 
			id int auto_increment primary key,
			migration varchar(255) not null,
			batch int not null
        )`);

	}

	public async getRan(): Promise<MigrationModel[]> {
		return await MigrationModel.query()
			.orderBy('batch', 'desc')
			.orderBy('id', 'desc')
			.get();
	}

	public async getRanMigrationNames(): Promise<string[]> {
		return (await this.getRan()).map(m => m.migration);
	}

	public async getPendingMigrations(migrations: ResolvedMigration[]): Promise<ResolvedMigration[]> {
		const ranMigrations = await this.getRanMigrationNames();

		return migrations.filter(migration => {
			return !ranMigrations.includes(migration.fileName);
		});
	}

	public async getLastBatchNumber(): Promise<number> {
		return await MigrationModel
			.query()
			.max('batch');
	}

	async getLastBatch(): Promise<MigrationModel[]> {
		return MigrationModel.query()
			.where('batch', await this.getLastBatchNumber())
			.orderBy('batch', 'desc')
			.orderBy('id', 'desc')
			.get();
	}

	public async getNextBatchNumber(): Promise<number> {
		const lastBatchNumber = await this.getLastBatchNumber();

		return (lastBatchNumber || 0) + 1;
	}

	storeMigrationRun(migration: string, batch: number) {
		return MigrationModel
			.query()
			.insert({migration, batch});
	}

	delete(batch: number) {
		return MigrationModel.query()
			.where('batch', batch)
			.delete();
	}

}
