import { MigrationInterface, QueryRunner } from "typeorm";

export class Content1748188822604 implements MigrationInterface {
    name = 'Content1748188822604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`content\` (\`id\` int NOT NULL AUTO_INCREMENT, \`onChainId\` int NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`ipfsHash\` varchar(255) NOT NULL, \`creatorAddress\` varchar(255) NOT NULL, \`contentType\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`isActive\` tinyint NOT NULL DEFAULT 0, INDEX \`IDX_39cdc6b8280df2f9d374deb6ff\` (\`creatorAddress\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_39cdc6b8280df2f9d374deb6ff\` ON \`content\``);
        await queryRunner.query(`DROP TABLE \`content\``);
    }

}
