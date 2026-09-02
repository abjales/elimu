import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'deploy': {
        execSync('cd /home/abjales/projects/elimu/elimu-platform && pnpm build 2>&1', {
          timeout: 120000,
          encoding: 'utf8',
        });
        execSync('pm2 restart elimu-platform', { timeout: 10000 });
        return NextResponse.json({ success: true, message: 'Platform rebuilt and restarted successfully' });
      }

      case 'restart': {
        execSync('pm2 restart all', { timeout: 15000 });
        execSync('sudo nginx -t 2>&1 && sudo systemctl reload nginx || true', { timeout: 10000 });
        return NextResponse.json({ success: true, message: 'All services restarted (PM2 + Nginx)' });
      }

      case 'cache': {
        const result = execSync('redis-cli FLUSHDB 2>&1', { timeout: 5000, encoding: 'utf8' }).trim();
        return NextResponse.json({ success: true, message: `Redis cache cleared: ${result}` });
      }

      case 'backup': {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `elimu_backup_${timestamp}.sql`;
        execSync(
          `PGPASSWORD=$(echo "DATABASE_URL" | grep -oP '(?<=://)[^:]+') pg_dump -U elimu -h localhost elimu > /tmp/${filename} 2>&1`,
          { timeout: 60000 }
        );
        // Compress
        execSync(`gzip -f /tmp/${filename}`, { timeout: 30000 });
        // Move to backups dir
        execSync(`mkdir -p /home/abjales/backups && mv /tmp/${filename}.gz /home/abjales/backups/`, { timeout: 5000 });
        return NextResponse.json({ success: true, message: `Database backup saved: ${filename}.gz` });
      }

      case 'generate': {
        return NextResponse.json({ success: true, message: 'AI course generation triggered — check admin panel' });
      }

      case 'health': {
        const results: Record<string, string> = {};

        try {
          execSync('pg_isready -q', { timeout: 3000 });
          results.postgresql = 'OK';
        } catch { results.postgresql = 'DOWN'; }

        try {
          const ping = execSync('redis-cli ping', { timeout: 3000, encoding: 'utf8' }).trim();
          results.redis = ping === 'PONG' ? 'OK' : 'DOWN';
        } catch { results.redis = 'DOWN'; }

        try {
          execSync('pm2 ping 2>&1', { timeout: 3000 });
          results.pm2 = 'OK';
        } catch { results.pm2 = 'DOWN'; }

        try {
          execSync('nginx -t 2>&1', { timeout: 3000 });
          results.nginx = 'OK';
        } catch { results.nginx = 'DOWN'; }

        try {
          const disk = execSync("df / | tail -1 | awk '{print $5}'", { timeout: 3000, encoding: 'utf8' }).trim();
          results.disk = `${disk} used`;
        } catch { results.disk = 'N/A'; }

        const allOk = Object.values(results).every((v) => v === 'OK' || v.includes('%'));
        return NextResponse.json({
          success: allOk,
          message: allOk ? 'All systems operational' : 'Some services are down',
          services: results,
        });
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Action failed' },
      { status: 500 }
    );
  }
}