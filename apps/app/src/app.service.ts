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

  async createMockData() {
    const client = await this.pool.connect();
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS leave (
          id UUID PRIMARY KEY,
          personnel_ids UUID[],
          start_date DATE,
          end_date DATE,
          leave_type VARCHAR(50),
          reason TEXT
        );
      `;

      const insertMockDataQuery = `
        INSERT INTO leave (id, personnel_ids, start_date, end_date, leave_type, reason) VALUES
        ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', ARRAY['e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13']::UUID[], '2024-07-01', '2024-07-05', 'ANNUAL', 'Annual leave for vacation'),
        ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', ARRAY['e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22']::UUID[], '2024-07-10', '2024-07-15', 'SICK', 'Sick leave for flu'),
        ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', ARRAY['e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33']::UUID[], '2024-07-20', '2024-07-25', 'PERSONAL', 'Personal leave for family reasons')
        ON CONFLICT (id) DO NOTHING;
      `;

      await client.query(createTableQuery);
      await client.query(insertMockDataQuery);

      console.log('Database setup completed successfully.');
    } catch (err) {
      console.error('Database setup failed:', err);
    } finally {
      client.release();
    }
  }
}
