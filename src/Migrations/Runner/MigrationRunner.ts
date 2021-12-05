import path from "path";
import {Migration} from "../Migration";
import {Table} from "../Table";
import type {MigrationRunnerBootOptions} from "../Types";
import type {ResolvedMigration} from "../Types";
import {MigrationRepository} from "./MigrationRepository";
import {sync} from 'glob';


export class MigrationRunner {

	private options: MigrationRunnerBootOptions = null;

	private repository: MigrationRepository;

	private migrations: ResolvedMigration[] = [];

	private batch: number = 0;

	constructor() {
		this.repository = new MigrationRepository();
	}

	setMigrations(migrations: ResolvedMigration[]) {
		this.migrations.push(...migrations);

		return this;
	}

	public async boot(options: MigrationRunnerBootOptions) {
		this.options = options;

		await this.repository.ensureMigrationTableExists();

		this.batch = await this.repository.getNextBatchNumber();

		await this.loadMigrationClasses();

		return this;
	}

	public async loadMigrationClasses() {
		for (let migrationDirectoryPath of this.options.paths) {
			const files = sync(migrationDirectoryPath, {cwd : process.cwd()})
				.map(file => {
					return path.relative(path.resolve(__dirname), path.resolve(file));
				});

			if (!files.length) {
				console.warn(`Skipping migration path: ${migrationDirectoryPath}, no migrations are defined here.`);
				continue;
			}

			const modules = (await Promise.all(files.map(async (file) => {
				return {
					resolved : await import(file),
					file     : file,
				};
			})));

			const resolvedMigrationClasses: ResolvedMigration[] = modules
				.map(({resolved, file}) => {
					const resolvedModuleKeys = Object.keys(resolved);

					for (let key of resolvedModuleKeys) {

						if (!(resolved[key].prototype instanceof Migration)) {
							continue;
						}

						const parsedPath = path.parse(file);

						return {
							migrationClass : resolved[key],
							file           : file,
							fileName       : parsedPath.name
						};
					}

					return null;
				})
				.filter(module => module !== null)
				.flat(1);

			if (resolvedMigrationClasses.length) {
				this.setMigrations(resolvedMigrationClasses);
			}

		}
	}

	public async runUp() {
		const startTime = new Date().getTime();

		const pendingMigrations = await this.repository.getPendingMigrations(this.migrations);

		if (pendingMigrations.length) {
			for (let migration of pendingMigrations) {
				await this.runMigrationUp(migration, this.batch);
			}
		}

		const endTime = new Date().getTime();

		console.log(`Finished running migrations (${(endTime - startTime) / 1000} seconds)`);
	}

	public async runDown() {
		const startTime = new Date().getTime();

		const ranMigrations = await this.repository.getRan();

		if (!ranMigrations.length) {
			return;
		}

		const rolledBack: ResolvedMigration[] = [];

		for (let ranMigration of ranMigrations) {

			const migration = this.migrations.find(m => m.fileName === ranMigration.migration);

			if (!migration) {
				console.warn(`Migration not found: ${ranMigration}`);
				continue;
			}

			await this.runMigrationDown(migration, ranMigration.batch);

			rolledBack.push(migration);
		}

		rolledBack.forEach(mig => {
			console.log(`Successfully rolled back migration: ${mig.fileName}`);
		});

		const endTime = new Date().getTime();

		console.log(`Finished running migrations (${(endTime - startTime) / 1000} seconds)`);
	}

	private async runMigrationUp(migration: ResolvedMigration, batch: number) {
		const startTime = new Date().getTime();

		const migrationInstance = new migration.migrationClass();
		migrationInstance.up();

		const builder = Table.getBuilder();
		await builder.run();

		await this.repository.storeMigrationRun(migration.fileName, batch);

		const endTime = new Date().getTime();

		console.log(`Migrated: ${migration.fileName} (${(endTime - startTime) / 1000} seconds)`);
	}

	private async runMigrationDown(migration: ResolvedMigration, batch: number) {
		const startTime = new Date().getTime();

		const migrationInstance = new migration.migrationClass();

		migrationInstance.down();

		const builder = Table.getBuilder();
		await builder.run();

		await this.repository.delete(batch);

		const endTime = new Date().getTime();
		console.log(`Rolled back: ${migration.fileName} (${(endTime - startTime) / 1000} seconds)`);
	}

	public async rollback() {
		const lastBatch = await this.repository.getLastBatch();

		if (!lastBatch.length) {
			console.log('No migrations to rollback.');
			return;
		}

		const rolledBack: ResolvedMigration[] = [];

		for (let batchedMigration of lastBatch) {
			const migration = this.migrations.find(m => m.fileName === batchedMigration.migration);

			if (!migration) {
				console.warn(`Migration not found: ${batchedMigration.migration}`);
				continue;
			}

			await this.runMigrationDown(migration, batchedMigration.batch);

			rolledBack.push(migration);
		}

		rolledBack.forEach(mig => {
			console.log(`Successfully rolled back migration: ${mig.fileName}`);
		});

	}
}
