import sqlite3 from 'sqlite3';
import { promisify } from 'util';
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
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./login_attempts.db');
    this.init();
  }

  private init() {
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

    this.db.run(createTable);
  }

  async saveLoginAttempt(
    email: string,
    password: string,
    rememberMe: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<number> {
    const passwordHash = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO login_attempts (email, password_hash, remember_me, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `;

      this.db.run(
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
  }

  async getAllLoginAttempts(): Promise<LoginAttempt[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, email, password_hash, remember_me, ip_address, user_agent, timestamp
        FROM login_attempts
        ORDER BY timestamp DESC
      `;

      this.db.all(query, (err: Error | null, rows: LoginAttempt[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  close() {
    this.db.close();
  }
}

export const database = new Database();
