import fs from 'fs';
import path from 'path';

export function getAppRoutes(baseDir = 'app', prefix = ''): string[] {
  const routes: string[] = [];
  const entries = fs.readdirSync(baseDir);

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip special folders
      if (['api', '(.)', '@'].some((p) => entry.startsWith(p))) continue;
      routes.push(...getAppRoutes(fullPath, `${prefix}/${entry}`));
    } else if (entry === 'page.tsx' || entry === 'page.jsx') {
      routes.push(prefix || '/');
    }
  }

  return routes;
}
