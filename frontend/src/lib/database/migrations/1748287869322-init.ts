import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1748287869322 implements MigrationInterface {
    name = 'Init1748287869322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`content\` (\`id\` int NOT NULL AUTO_INCREMENT, \`onChainId\` int NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`ipfsHash\` varchar(255) NOT NULL, \`creatorAddress\` varchar(255) NOT NULL, \`contentType\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`isActive\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_39cdc6b8280df2f9d374deb6ff\` (\`creatorAddress\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`license\` (\`id\` int NOT NULL AUTO_INCREMENT, \`duration\` enum ('0', '1', '2') NOT NULL, \`price\` decimal(18,6) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`content_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`license\` ADD CONSTRAINT \`FK_789bf62ca3c23b4e7d489496948\` FOREIGN KEY (\`content_id\`) REFERENCES \`content\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`license\` DROP FOREIGN KEY \`FK_789bf62ca3c23b4e7d489496948\``);
        await queryRunner.query(`DROP TABLE \`license\``);
        await queryRunner.query(`DROP INDEX \`IDX_39cdc6b8280df2f9d374deb6ff\` ON \`content\``);
        await queryRunner.query(`DROP TABLE \`content\``);
    }

}
