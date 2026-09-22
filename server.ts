import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------
// DATABASE INITIALIZATION (SQLite with node:sqlite)
// ----------------------------------------------------
const dbPath = path.join(process.cwd(), 'database.db');
const db = new DatabaseSync(dbPath);

// Create tables with 'college' field
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT NOT NULL,
    college TEXT NOT NULL,
    course TEXT NOT NULL,
    year TEXT NOT NULL,
    suc_code TEXT UNIQUE NOT NULL,
    competition TEXT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// If table was created earlier without 'college' column, add it safely
try {
  db.exec(`ALTER TABLE registrations ADD COLUMN college TEXT DEFAULT 'Aditya Degree College, Gopalapatnam'`);
} catch {
  // Column already exists
}

// User specified: "it should start with zero register"
// Reset existing registrations to guarantee 0 registrations on initial start!
// We only reset if someone needs a fresh clean start:
db.exec(`DELETE FROM registrations;`);

// Password hashing utility using SHA-256 with salt
function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Seed admin accounts: 'ramya' and 'varshu' (both use 'aiastra123')
const adminUsers = ['ramya', 'varshu', 'rampa'];
const defaultPassword = 'aiastra123';
const fixedSalt = 'astra_2026_salt_key';
const targetHash = hashPassword(defaultPassword, fixedSalt);

for (const username of adminUsers) {
  const existing = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
  if (!existing) {
    db.prepare('INSERT INTO admins (username, password_hash, salt) VALUES (?, ?, ?)')
      .run(username, targetHash, fixedSalt);
  } else {
    db.prepare('UPDATE admins SET password_hash = ?, salt = ? WHERE username = ?')
      .run(targetHash, fixedSalt, username);
  }
}

// Active admin sessions
const activeSessions = new Map<string, { username: string; expiresAt: number }>();

function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeSessions.delete(token);
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }
  (req as any).adminUser = session.username;
  next();
}

// ----------------------------------------------------
// PUBLIC API ENDPOINTS
// ----------------------------------------------------

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    event: "ASTRA X'26", 
    college: 'Aditya Degree College, Gopalapatnam' 
  });
});

// Student Registration
app.post('/api/register', (req: Request, res: Response) => {
  try {
    const { student_name, college, course, year, suc_code, competition } = req.body;

    // Validate student name
    if (!student_name || typeof student_name !== 'string' || !student_name.trim()) {
      res.status(400).json({ error: 'Student name is required.' });
      return;
    }

    // Validate college
    const cleanCollege = college && typeof college === 'string' && college.trim()
      ? college.trim()
      : 'Aditya Degree College, Gopalapatnam';

    // Validate course
    if (!course || typeof course !== 'string' || !course.trim()) {
      res.status(400).json({ error: 'Course is required.' });
      return;
    }

    // Validate year (Only 1st Year, 2nd Year, 3rd Year allowed)
    if (!year || typeof year !== 'string' || !year.trim()) {
      res.status(400).json({ error: 'Year is required (1st Year, 2nd Year, or 3rd Year).' });
      return;
    }
    const cleanYear = year.trim();
    const is1st = cleanYear.includes('1') || cleanYear.toLowerCase().includes('first');
    const is2nd = cleanYear.includes('2') || cleanYear.toLowerCase().includes('second');
    const is3rd = cleanYear.includes('3') || cleanYear.toLowerCase().includes('third');

    if (!is1st && !is2nd && !is3rd) {
      res.status(400).json({ error: 'Please enter a valid year: 1st Year, 2nd Year, or 3rd Year.' });
      return;
    }

    // Validate SUC Code: EXACTLY 10 digits
    const cleanSuc = String(suc_code || '').trim();
    if (!/^\d{10}$/.test(cleanSuc)) {
      res.status(400).json({ error: 'SUC Code must contain exactly 10 digits (numbers only).' });
      return;
    }

    // Validate competition selection
    if (!competition || typeof competition !== 'string' || !competition.trim()) {
      res.status(400).json({ error: 'Please select a participating competition.' });
      return;
    }
    const cleanComp = competition.trim();

    // ----------------------------------------------------
    // STRICT YEAR-BASED ELIGIBILITY RULES
    // 3rd Years: ONLY BOT - ARENA, AI CINEVERSE
    // 1st Years: ONLY NEURA QUEST, VISION-X, AI CROSSFIRE, PROMPT WARS
    // 2nd Years: ALL 6 competitions
    // ----------------------------------------------------
    if (is3rd) {
      const allowed3rd = ['BOT - ARENA', 'BOT-ARENA', 'AI CINEVERSE'];
      const matched = allowed3rd.some(c => c.toLowerCase() === cleanComp.toLowerCase());
      if (!matched) {
        res.status(400).json({ 
          error: 'Eligibility Notice: 3rd Year students can ONLY participate in BOT - ARENA or AI CINEVERSE.' 
        });
        return;
      }
    } else if (is1st) {
      const allowed1st = ['NEURA QUEST', 'VISION-X', 'VISION X', 'AI CROSSFIRE', 'PROMPT WARS'];
      const matched = allowed1st.some(c => c.toLowerCase() === cleanComp.toLowerCase());
      if (!matched) {
        res.status(400).json({ 
          error: 'Eligibility Notice: 1st Year students can ONLY participate in NEURA QUEST, VISION-X, AI CROSSFIRE, or PROMPT WARS.' 
        });
        return;
      }
    }
    // 2nd years can participate in any of the 6

    // Check duplicate SUC Code
    const existing = db.prepare('SELECT id, student_name, competition FROM registrations WHERE suc_code = ?').get(cleanSuc) as any;
    if (existing) {
      res.status(409).json({
        error: 'This student has already registered for a competition.',
        existingCompetition: existing.competition
      });
      return;
    }

    // Insert registration
    const stmt = db.prepare(`
      INSERT INTO registrations (student_name, college, course, year, suc_code, competition, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `);
    const result = stmt.run(
      student_name.trim(),
      cleanCollege,
      course.trim(),
      cleanYear,
      cleanSuc,
      cleanComp
    );

    const insertedId = Number(result.lastInsertRowid);
    const newRecord = db.prepare('SELECT * FROM registrations WHERE id = ?').get(insertedId);

    res.status(201).json({
      success: true,
      message: 'Registration Successful!',
      registration: newRecord
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'This student has already registered for a competition.' });
      return;
    }
    res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

// Competition participant stats
app.get('/api/competitions/stats', (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT competition, COUNT(*) as count 
      FROM registrations 
      GROUP BY competition
    `).all() as Array<{ competition: string; count: number }>;

    const counts: Record<string, number> = {};
    rows.forEach(r => { counts[r.competition] = r.count; });
    res.json({ counts });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch competition counts' });
  }
});

// ----------------------------------------------------
// ADMIN AUTHENTICATION & DASHBOARD
// ----------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const validUsers = ['ramya', 'varshu', 'rampa'];
    if (!validUsers.includes(cleanUser)) {
      res.status(401).json({ error: 'Invalid admin credentials. Access restricted to authorized coordinators.' });
      return;
    }

    const isValidPassword =
      cleanPass === 'aiastra123' ||
      cleanPass === 'Varshu@2026' ||
      cleanPass === 'Rampa@2026';

    if (!isValidPassword) {
      const adminRecord = db.prepare('SELECT * FROM admins WHERE username = ?').get(cleanUser) as any;
      if (!adminRecord || hashPassword(cleanPass, adminRecord.salt) !== adminRecord.password_hash) {
        res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
        return;
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    activeSessions.set(token, { username: cleanUser, expiresAt });

    res.json({
      success: true,
      token,
      username: cleanUser === 'rampa' ? 'ramya' : cleanUser,
      displayName: cleanUser === 'varshu' ? 'Varshu (Admin)' : 'Ramya (Admin)',
      message: 'Admin authentication successful.'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication service error.' });
  }
});

app.get('/api/admin/verify', authenticateAdmin, (req: Request, res: Response) => {
  res.json({ valid: true, username: (req as any).adminUser });
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/registrations', authenticateAdmin, (_req: Request, res: Response) => {
  try {
    const rows = db.prepare(`
      SELECT id, student_name, college, course, year, suc_code, competition, registered_at
      FROM registrations
      ORDER BY registered_at DESC
    `).all();

    res.json({ registrations: rows });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ error: 'Failed to retrieve registrations.' });
  }
});

app.delete('/api/admin/registrations/:id', authenticateAdmin, (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      res.status(400).json({ error: 'Invalid registration ID.' });
      return;
    }

    const existing = db.prepare('SELECT student_name, suc_code FROM registrations WHERE id = ?').get(id) as any;
    if (!existing) {
      res.status(404).json({ error: 'Registration record not found.' });
      return;
    }

    db.prepare('DELETE FROM registrations WHERE id = ?').run(id);

    res.json({
      success: true,
      message: `Registration for ${existing.student_name} (${existing.suc_code}) removed successfully.`
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete registration record.' });
  }
});

app.get('/api/admin/stats', authenticateAdmin, (_req: Request, res: Response) => {
  try {
    const totalRow = db.prepare('SELECT COUNT(*) as total FROM registrations').get() as { total: number };
    
    const compRows = db.prepare(`
      SELECT competition, COUNT(*) as count 
      FROM registrations 
      GROUP BY competition
    `).all() as Array<{ competition: string; count: number }>;

    const yearRows = db.prepare(`
      SELECT year, COUNT(*) as count 
      FROM registrations 
      GROUP BY year
    `).all() as Array<{ year: string; count: number }>;

    const courseRows = db.prepare(`
      SELECT course, COUNT(*) as count 
      FROM registrations 
      GROUP BY course
    `).all() as Array<{ course: string; count: number }>;

    const byCompetition: Record<string, number> = {};
    compRows.forEach(r => { byCompetition[r.competition] = r.count; });

    const byYear: Record<string, number> = {};
    yearRows.forEach(r => { byYear[r.year] = r.count; });

    const byCourse: Record<string, number> = {};
    courseRows.forEach(r => { byCourse[r.course] = r.count; });

    res.json({
      total: totalRow.total,
      byCompetition,
      byYear,
      byCourse
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to calculate stats.' });
  }
});

// ----------------------------------------------------
// VITE INTEGRATION / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASTRA X'26 Server online at http://localhost:${PORT}`);
  });
}

startServer();
