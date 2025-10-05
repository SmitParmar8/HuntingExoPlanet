import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Prediction } from '../types';
import { getPredictions, clearPredictions } from '../utils/storage';
import { Download, Trash2, Filter, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function History() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filter, setFilter] = useState<'all' | 'candidate' | 'false_positive' | 'unknown'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'confidence'>('newest');

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = () => {
    const data = getPredictions();
    setPredictions(data);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all prediction history?')) {
      clearPredictions();
      loadPredictions();
    }
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Model', 'Result', 'Confidence', 'Signal/Noise', 'Transit Depth', 'Orbital Period'].join(','),
      ...filteredPredictions.map((p) =>
        [
          new Date(p.timestamp).toLocaleString(),
          p.modelName,
          p.result.status,
          p.result.confidence,
          p.input.signalToNoise,
          p.input.transitDepth,
          p.input.orbitalPeriod
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astrokit-predictions-${Date.now()}.csv`;
    a.click();
  };

  const filteredPredictions = predictions
    .filter((p) => filter === 'all' || p.result.status === filter)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else {
        return b.result.confidence - a.result.confidence;
      }
    });

  const statusIcons = {
    candidate: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    false_positive: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    unknown: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent mb-4">
            Prediction History
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Review and analyze all previous exoplanet candidate predictions
          </p>
        </motion.div>

        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">Filter:</span>
              </div>
              {['all', 'candidate', 'false_positive', 'unknown'].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f as typeof filter)}
                >
                  {f.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="confidence">Highest Confidence</option>
              </select>

              <Button variant="outline" size="sm" onClick={handleExport} disabled={predictions.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>

              <Button variant="outline" size="sm" onClick={handleClear} disabled={predictions.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </Card>

        {filteredPredictions.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Predictions Yet</h3>
            <p className="text-gray-400 mb-6">
              {predictions.length === 0
                ? 'Start by making your first prediction on the Dashboard'
                : 'No predictions match the current filter'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPredictions.map((prediction, idx) => {
              const config = statusIcons[prediction.result.status];
              const Icon = config.icon;

              return (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-6 hover:border-cyan-500/40 transition-all" hover>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${config.bg}`}>
                          <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-xl font-bold ${config.color}`}>
                              {prediction.result.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </h3>
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">
                              {prediction.modelName}
                            </span>
                          </div>

                          <p className="text-gray-400 text-sm mb-3">
                            {new Date(prediction.timestamp).toLocaleString()}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <p className="text-xs text-gray-500">Signal/Noise</p>
                              <p className="text-sm font-semibold text-white">
                                {prediction.input.signalToNoise?.toFixed?.(1) ?? '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Orbital Period</p>
                              <p className="text-sm font-semibold text-white">
                                {prediction.input.orbitalPeriod?.toFixed?.(1) ?? '—'} days
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Planet Radius</p>
                              <p className="text-sm font-semibold text-white">
                                {prediction.input.planetRadius?.toFixed?.(1) ?? '—'} R⊕
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center lg:ml-6 p-4 bg-gray-900/50 rounded-lg min-w-[120px]">
                        <p className="text-xs text-gray-400 mb-1">Confidence</p>
                        <p className={`text-3xl font-bold ${config.color}`}>
                          {Math.round(prediction.result.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredPredictions.length > 0 && (
          <div className="mt-8 text-center text-gray-400">
            Showing {filteredPredictions.length} of {predictions.length} predictions
          </div>
        )}
      </div>
    </div>
  );
}
