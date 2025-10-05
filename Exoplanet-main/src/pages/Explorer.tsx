import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Upload } from 'lucide-react';
import { apiService } from '../services/api';

const DEFAULT_COLORS = {
  confirmed: '#22c55e',
  candidate: '#06b6d4',
  false_positive: '#ef4444',
  unknown: '#f59e0b'
};

export function Explorer() {
  const [activeChart, setActiveChart] = useState<'scatter' | 'distribution' | 'missions' | 'orbital'>('scatter');
  const [customRows, setCustomRows] = useState<Array<Record<string, string | number>>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avgConfidence, setAvgConfidence] = useState<number | null>(null);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return setCustomRows([]);
    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const cells = line.split(',');
      const obj: Record<string, string | number> = {};
      headers.forEach((h, i) => {
        const raw = (cells[i] ?? '').trim();
        const num = Number(raw);
        obj[h] = raw !== '' && !Number.isNaN(num) ? num : raw;
      });
      return obj;
    });
    setCustomRows(rows);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const handleBrowse: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  // Fetch average confidence from backend prediction history
  useEffect(() => {
    (async () => {
      try {
        const history = await apiService.getPredictionHistory();
        if (history.length === 0) {
          setAvgConfidence(null);
          return;
        }
        const mean = history.reduce((sum, h) => sum + (h.confidence ?? 0), 0) / history.length;
        setAvgConfidence(mean);
      } catch (e) {
        setAvgConfidence(null);
      }
    })();
  }, []);

  // Derived data and stats
  const usingUploaded = customRows.length > 0;
  const requiredCols = ['koi_model_snr','koi_depth','koi_prad','koi_teq','koi_duration','koi_period','status'];

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { confirmed: 0, candidate: 0, false_positive: 0, unknown: 0 };
    if (!usingUploaded) return counts;
    for (const r of customRows) {
      const s = String(r.status ?? 'unknown').toLowerCase();
      counts[s] = (counts[s] ?? 0) + 1;
    }
    return counts;
  }, [customRows, usingUploaded]);

  const scatterData = useMemo(() => {
    if (!usingUploaded) return [] as Array<{ radius: number; temperature: number; status: string }>;
    return customRows
      .filter((r) => r.koi_prad != null && r.koi_teq != null)
      .map((r) => ({
        radius: Number(r.koi_prad),
        temperature: Number(r.koi_teq),
        status: String(r.status ?? 'unknown').toLowerCase()
      }));
  }, [customRows, usingUploaded]);

  const distributionData = useMemo(() => {
    if (!usingUploaded) return [] as Array<{ name: string; value: number; color: string }>;
    return [
      { name: 'Confirmed', value: statusCounts.confirmed, color: DEFAULT_COLORS.confirmed },
      { name: 'Candidate', value: statusCounts.candidate, color: DEFAULT_COLORS.candidate },
      { name: 'False Positive', value: statusCounts.false_positive, color: DEFAULT_COLORS.false_positive },
      { name: 'Unknown', value: statusCounts.unknown, color: DEFAULT_COLORS.unknown }
    ].filter((d) => d.value > 0);
  }, [statusCounts, usingUploaded]);

  const orbitalData = useMemo(() => {
    if (!usingUploaded) return [] as Array<{ range: string; count: number }>;
    const bins = [
      { label: '0-10d', min: 0, max: 10 },
      { label: '10-50d', min: 10, max: 50 },
      { label: '50-100d', min: 50, max: 100 },
      { label: '100-200d', min: 100, max: 200 },
      { label: '200+d', min: 200, max: Infinity }
    ];
    const counts = bins.map((b) => ({ range: b.label, count: 0 }));
    for (const r of customRows) {
      const val = Number(r.koi_period);
      if (Number.isFinite(val)) {
        const idx = bins.findIndex((b) => val >= b.min && val < b.max);
        if (idx >= 0) counts[idx].count += 1;
      }
    }
    return counts;
  }, [customRows, usingUploaded]);

  const summaryStats = useMemo(() => {
    const getNum = (k: string) => customRows.map((r) => Number(r[k])).filter((x) => Number.isFinite(x));
    const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const med = (arr: number[]) => {
      if (!arr.length) return 0;
      const s = [...arr].sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
    };
    const snr = getNum('koi_model_snr');
    const depth = getNum('koi_depth');
    const period = getNum('koi_period');
    return {
      rows: customRows.length,
      snrMean: mean(snr),
      depthMedian: med(depth),
      periodMean: mean(period)
    };
  }, [customRows]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent mb-4">
            Data Explorer
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Explore exoplanet candidates with clear visuals. Upload a CSV with columns: <span className="text-gray-300 font-semibold">koi_model_snr, koi_depth, koi_prad, koi_teq, koi_duration, koi_period, status</span>.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: 'scatter', label: 'Radius vs Temperature', icon: TrendingUp },
            { id: 'distribution', label: 'Status Distribution', icon: PieChartIcon },
            { id: 'missions', label: 'Mission Comparison', icon: BarChart3 },
            { id: 'orbital', label: 'Orbital Periods', icon: BarChart3 }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeChart === id ? 'primary' : 'outline'}
              onClick={() => setActiveChart(id as typeof activeChart)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8 mb-8">
            <div className="h-96">
              {activeChart === 'scatter' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      type="number"
                      dataKey="temperature"
                      name="Temperature"
                      unit="K"
                      stroke="#9ca3af"
                      label={{ value: 'Planet Temperature (K)', position: 'bottom', offset: 40, fill: '#9ca3af' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="radius"
                      name="Radius"
                      unit="R⊕"
                      stroke="#9ca3af"
                      label={{ value: 'Planet Radius (Earth Radii)', angle: -90, position: 'left', offset: 40, fill: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Scatter name="Candidates" data={scatterData.filter((d) => d.status === 'candidate')} fill={DEFAULT_COLORS.candidate} opacity={0.6} />
                    <Scatter name="Confirmed" data={scatterData.filter((d) => d.status === 'confirmed')} fill={DEFAULT_COLORS.confirmed} opacity={0.6} />
                    <Scatter name="False Positives" data={scatterData.filter((d) => d.status === 'false_positive')} fill={DEFAULT_COLORS.false_positive} opacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              )}

              {activeChart === 'distribution' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {activeChart === 'missions' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Uploaded Data', candidates: statusCounts.candidate, confirmed: statusCounts.confirmed }]} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      label={{ value: 'Mission', position: 'bottom', offset: 40, fill: '#9ca3af' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      label={{ value: 'Count', angle: -90, position: 'left', offset: 0, fill: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="candidates" fill={DEFAULT_COLORS.candidate} name="Candidates" />
                    <Bar dataKey="confirmed" fill={DEFAULT_COLORS.confirmed} name="Confirmed" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeChart === 'orbital' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orbitalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="range"
                      stroke="#9ca3af"
                      label={{ value: 'Orbital Period Range', position: 'bottom', offset: 40, fill: '#9ca3af' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      label={{ value: 'Number of Planets', angle: -90, position: 'left', offset: 0, fill: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" name="Planets" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-400">
              {activeChart === 'scatter' && (
                <p>How to read: Each point is a candidate from your CSV. X-axis shows equilibrium temperature (koi_teq) and Y-axis shows planet radius (koi_prad). Colors indicate status.</p>
              )}
              {activeChart === 'distribution' && (
                <p>How to read: This pie shows the composition of statuses in your uploaded data: Confirmed, Candidate, False Positive, or Unknown.</p>
              )}
              {activeChart === 'missions' && (
                <p>How to read: Bars compare the count of candidates and confirmed objects in your uploaded dataset.</p>
              )}
              {activeChart === 'orbital' && (
                <p>How to read: Histogram of orbital period (koi_period) grouped into ranges.</p>
              )}
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold text-white mb-2">Upload Custom Dataset</h3>
                <p className="text-gray-400">
                  Upload your own exoplanet data in CSV format for analysis
                </p>
                <ul className="text-gray-500 text-sm mt-3 list-disc list-inside">
                  <li>Required columns: {requiredCols.join(', ')}</li>
                  <li>Statuses expected: candidate, confirmed, false_positive, unknown</li>
                </ul>
              </div>

              <div
                className="flex flex-col items-center p-8 border-2 border-dashed border-gray-700 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer"
                onClick={handlePickFile}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-500 mb-3" />
                <p className="text-gray-400 text-sm">Drop files here or click to browse</p>
                <p className="text-gray-600 text-xs mt-1">CSV format, max 10MB</p>
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleBrowse} />
              </div>
            </div>
          </Card>

          {customRows.length > 0 && (
            <Card className="p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">Preview ({customRows.length.toLocaleString()} rows)</h4>
                <div className="text-xs text-gray-400">
                  <span className="mr-4">Candidates: <span className="text-cyan-400">{statusCounts.candidate}</span></span>
                  <span className="mr-4">Confirmed: <span className="text-green-400">{statusCounts.confirmed}</span></span>
                  <span className="mr-4">False Positive: <span className="text-red-400">{statusCounts.false_positive}</span></span>
                  <span>Unknown: <span className="text-yellow-400">{statusCounts.unknown}</span></span>
                </div>
              </div>
              <div className="overflow-auto max-h-96 border border-gray-800 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-900 sticky top-0">
                    <tr>
                      {Object.keys(customRows[0]).map((h) => (
                        <th key={h} className="text-left text-gray-400 font-medium px-3 py-2 border-b border-gray-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customRows.slice(0, 50).map((row, i) => (
                      <tr key={i} className={i % 2 ? 'bg-gray-900/30' : ''}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-2 text-gray-300 border-b border-gray-900/40">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-xs mt-2">Showing first 50 rows.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="p-3 bg-gray-900/50 rounded">
                  <p className="text-gray-400 text-xs mb-1">Avg SNR (koi_model_snr)</p>
                  <p className="text-cyan-400 text-lg font-semibold">{summaryStats.snrMean.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <p className="text-gray-400 text-xs mb-1">Median Depth (koi_depth)</p>
                  <p className="text-cyan-400 text-lg font-semibold">{summaryStats.depthMedian.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded">
                  <p className="text-gray-400 text-xs mb-1">Avg Period (koi_period, days)</p>
                  <p className="text-cyan-400 text-lg font-semibold">{summaryStats.periodMean.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Total Planets Analyzed</p>
              <p className="text-4xl font-bold text-cyan-400">300</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Confirmed Candidates</p>
              <p className="text-4xl font-bold text-green-400">145</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Average Confidence</p>
              <p className="text-4xl font-bold text-blue-400">
                {avgConfidence == null ? '—' : `${Math.round(avgConfidence * 100)}%`}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
