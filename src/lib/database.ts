import sqlite3 from 'sqlite3';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

export interface LoginAttempt {
  id?: number;
  email: string;
  password_hash: string;
  remember_me: boolean;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

class Database {
  private db?: sqlite3.Database;
  private pgPool?: Pool;
  private isProd: boolean;

  constructor() {
    this.isProd = process.env.NODE_ENV === "production";
    if (this.isProd) {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is required in production.");
      }
      this.pgPool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
      this.initPostgres();
    } else {
      const dbPath = "./login_attempts.db";
      this.db = new sqlite3.Database(dbPath);
      this.initSqlite();
    }
  }

  private async initPostgres() {
    if (!this.pgPool) return;
    await this.pgPool.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        remember_me BOOLEAN DEFAULT FALSE,
        ip_address TEXT,
        user_agent TEXT,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private initSqlite() {
    const createTable = `
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        remember_me BOOLEAN DEFAULT FALSE,
        ip_address TEXT,
        user_agent TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    if (this.db) {
      this.db.run(createTable);
    }
  }

  async saveLoginAttempt(
    email: string,
    password: string,
    rememberMe: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<number> {
    const passwordHash = await bcrypt.hash(password, 10);

    if (this.isProd && this.pgPool) {
      const result = await this.pgPool.query(
        `INSERT INTO login_attempts (email, password_hash, remember_me, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [email, passwordHash, rememberMe, ipAddress, userAgent]
      );
      return result.rows[0].id;
    } else if (this.db) {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT INTO login_attempts (email, password_hash, remember_me, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?)
        `;
        this.db!.run(
          query,
          [email, passwordHash, rememberMe, ipAddress, userAgent],
          function(this: sqlite3.RunResult, err: Error | null) {
            if (err) {
              reject(err);
            } else {
              resolve(this.lastID);
            }
          }
        );
      });
    } else {
      throw new Error("Database not initialized");
    }
  }

  async getAllLoginAttempts(): Promise<LoginAttempt[]> {
    if (this.isProd && this.pgPool) {
      const result = await this.pgPool.query(
        `SELECT id, email, password_hash, remember_me, ip_address, user_agent, timestamp
         FROM login_attempts
         ORDER BY timestamp DESC`
      );
      return result.rows;
    } else if (this.db) {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT id, email, password_hash, remember_me, ip_address, user_agent, timestamp
          FROM login_attempts
          ORDER BY timestamp DESC
        `;
        this.db!.all(query, (err: Error | null, rows: LoginAttempt[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } else {
      throw new Error("Database not initialized");
    }
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async close() {
    if (this.db) {
      this.db.close();
    }
    if (this.pgPool) {
      await this.pgPool.end();
    }
  }
}

export const database = new Database();
