import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // CPU usage
    const cpuInfo = execSync(
      "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1",
      { encoding: 'utf8', timeout: 5000 }
    ).trim() || '0';

    // Memory
    const memInfo = execSync(
      "free -b | awk '/Mem:/ {printf \"%.0f %.0f\", $3/$2*100, $2/1073741824}'",
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    const [memPct, memTotalGb] = memInfo.split(' ').map(Number);
    const memUsedGb = parseFloat(((memPct / 100) * memTotalGb).toFixed(1));

    // Disk
    const diskInfo = execSync(
      "df / | tail -1 | awk '{printf \"%.0f %.0f %.0f\", $3/$2*100, $3/1073741824, $2/1073741824}'",
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    const [diskPct, diskUsed, diskTotal] = diskInfo.split(' ').map(Number);

    // Uptime
    const uptimeRaw = execSync(
      "uptime -p | sed 's/up //'",
      { encoding: 'utf8', timeout: 5000 }
    ).trim();

    // Load average
    const loadRaw = execSync(
      "cat /proc/loadavg | awk '{print $1, $2, $3}'",
      { encoding: 'utf8', timeout: 5000 }
    ).trim();
    const loadAvg = loadRaw.split(' ').map(Number);

    // Processes
    const procs = parseInt(
      execSync("ps aux | wc -l", { encoding: 'utf8', timeout: 5000 }).trim(),
      10
    );

    // Network
    const netRx = execSync(
      "cat /sys/class/net/eth0/statistics/rx_bytes 2>/dev/null || echo 0",
      { encoding: 'utf8', timeout: 3000 }
    ).trim();
    const netTx = execSync(
      "cat /sys/class/net/eth0/statistics/tx_bytes 2>/dev/null || echo 0",
      { encoding: 'utf8', timeout: 3000 }
    ).trim();

    // Get swap info
    const swapRaw = execSync(
      "free -b | awk '/Swap:/ {printf \"%.0f %.0f\", $3/$2*100, $2/1073741824}'",
      { encoding: 'utf8', timeout: 5000 }
    ).trim();

    return NextResponse.json({
      cpu: Math.round(parseFloat(cpuInfo) || 0),
      memory: Math.round(memPct || 0),
      memoryUsed: memUsedGb || 0,
      memoryTotal: Math.round(memTotalGb || 0),
      disk: Math.round(diskPct || 0),
      diskUsed: diskUsed || 0,
      diskTotal: diskTotal || 0,
      uptime: uptimeRaw || 'N/A',
      loadAvg: loadAvg.length === 3 ? loadAvg : [0, 0, 0],
      processes: procs || 0,
      networkRx: parseInt(netRx) || 0,
      networkTx: parseInt(netTx) || 0,
      swap: swapRaw || '0 0',
      timestamp: Date.now(),
    });
  } catch (error) {
    // Fallback with basic info
    return NextResponse.json({
      cpu: 0,
      memory: 0,
      memoryUsed: 0,
      memoryTotal: 0,
      disk: 0,
      diskUsed: 0,
      diskTotal: 0,
      uptime: 'N/A',
      loadAvg: [0, 0, 0],
      processes: 0,
      networkRx: 0,
      networkTx: 0,
      swap: '0 0',
      timestamp: Date.now(),
      error: 'Failed to fetch system metrics',
    });
  }
}