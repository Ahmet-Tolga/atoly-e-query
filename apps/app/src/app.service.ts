import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { QueryDto } from './Dto/query.dto';

@Injectable()
export class AppService {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  async findAll(queryLeaveDto: QueryDto) {
    const client = await this.pool.connect();

    try {
      const query = this.buildQuery(queryLeaveDto);
      const values = this.extractValues(queryLeaveDto);

      const result = await client.query(query, values);
      return result.rows;
    } catch (err) {
      throw new NotFoundException(`Error querying table: ${queryLeaveDto.tableName}`);
    } finally {
      client.release();
    }
  }

  private buildQuery(queryLeaveDto: QueryDto): string {
    const { tableName, columnNames, where } = queryLeaveDto;
    let query = `SELECT * FROM ${tableName}`;

    if (columnNames && columnNames.length > 0) {
      const columns = columnNames.join(', ');
      query = `SELECT ${columns} FROM ${tableName}`;
    }

    if (where && Object.keys(where).length > 0) {
      const conditions = Object.keys(where).map((key, index) => {
        const condition = where[key];
        return `${key} ${condition.operator} $${index + 1}`;
      }).join(' AND ');

      query += ` WHERE ${conditions}`;
    }

    return query;
  }

  private extractValues(queryLeaveDto: QueryDto): any[] {
    const { where } = queryLeaveDto;
    const values: any[] = [];

    if (where && Object.keys(where).length > 0) {
      Object.keys(where).forEach((key) => {
        const condition = where[key];
        values.push(condition.value);
      });
    }

    return values;
  }
}
