const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import {
  Upload, Play, Loader, AlertCircle, CheckCircle, TrendingUp, Users,
  BookOpen, MessageSquare, Target, Award, Download, Settings, Menu,
  BarChart3, Zap, Lightbulb
} from 'lucide-react';

const ClassPulseFrontend = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const fileInputRef = useRef(null);

  const API_BASE = "http://localhost:8000";

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/sessions`);
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
      setSelectedSession(data);
      setFile(null);
      setActiveView('dashboard');
      loadSessions();
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const report = `
CLASSPULSE TEACHING ANALYTICS REPORT
====================================

Session: ${result.file_name}
Date: ${new Date(result.timestamp).toLocaleString()}
Duration: ${(result.duration / 60).toFixed(1)} minutes

KEY METRICS
===========
Talk Ratio (Instructor): ${result.metrics.talk_ratio}%
Questions Detected: ${result.metrics.questions}
Average Wait Time: ${result.metrics.avg_wait_time}s
Lecture Pace: ${result.metrics.lecture_pace} wpm
Engagement Score: ${result.metrics.engagement_score}/100

TEACHING METRICS
================
Instructor Time: ${result.teaching_metrics.instructor_time}s
Student Time: ${result.teaching_metrics.student_time}s
Silence Time: ${result.teaching_metrics.silence_time}s
Content Coverage: ${result.teaching_metrics.content_coverage}%
Speech Clarity: ${result.teaching_metrics.speech_clarity}%
Interaction Rate: ${result.teaching_metrics.interaction_rate} questions/min
Engagement Score: ${result.teaching_metrics.engagement_score}/100

AI ANALYSIS
===========
Title: ${result.ai_summary.session_title}
Overview: ${result.ai_summary.overview}

Key Topics:
${result.ai_summary.key_topics.map(t => `  • ${t}`).join('\n')}

Strengths:
${result.ai_summary.strengths.map(s => `  ✓ ${s}`).join('\n')}

Areas for Improvement:
${result.ai_summary.improvements.map(i => `  ⚠ ${i}`).join('\n')}

Student Engagement: ${result.ai_summary.student_engagement}
Teaching Style: ${result.ai_summary.teaching_style}

RECOMMENDATIONS
===============
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `classpulse_${result.session_id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-2xl font-bold text-teal-600">Class</h1>
              <p className="text-xs text-gray-500 font-semibold">TEACHING ANALYTICS</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* MAIN MENU */}
        {sidebarOpen && (
          <div className="px-4 py-8">
            <p className="text-xs font-bold text-gray-400 mb-4">MAIN</p>
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'sessions', label: 'Sessions', icon: Users },
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'transcript', label: 'Transcript', icon: BookOpen }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeView === item.id
                      ? 'bg-teal-50 text-teal-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* ANALYTICS MENU */}
            <p className="text-xs font-bold text-gray-400 mt-8 mb-4">ANALYTICS</p>
            <nav className="space-y-2">
              {[
                { id: 'insights', label: 'AI Insights', icon: Lightbulb },
                { id: 'metrics', label: 'Metrics', icon: TrendingUp }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeView === item.id
                      ? 'bg-teal-50 text-teal-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* USER PROFILE */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-600">
                DS
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Dr. Surabhi Shanker</p>
                <p className="text-xs text-gray-500">Teacher</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            {result ? (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                Demo Mode — Backend offline
              </span>
            ) : (
              <span className="text-gray-500 text-sm">No session selected</span>
            )}
            {result && (
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto">
          {activeView === 'upload' ? (
            <UploadView file={file} loading={loading} error={error} onFileSelect={handleFileSelect} onUpload={handleUpload} fileInputRef={fileInputRef} />
          ) : activeView === 'dashboard' && result ? (
            <DashboardView result={result} />
          ) : activeView === 'metrics' && result ? (
            <MetricsView result={result} />
          ) : activeView === 'insights' && result ? (
            <InsightsView result={result} />
          ) : activeView === 'sessions' ? (
            <SessionsView sessions={sessions} onSelectSession={setSelectedSession} onLoadSession={(s) => { setResult(s); setActiveView('dashboard'); }} />
          ) : (
            <div className="p-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Demo Dashboard</h3>
                <p className="text-gray-600">Upload a recording to see your real metrics - Sample data shown below</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// VIEW COMPONENTS
// ============================================

function UploadView({ file, loading, error, onFileSelect, onUpload, fileInputRef }) {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition mb-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-700 font-semibold mb-2">
              {file ? `📁 ${file.name}` : 'Click to upload audio file'}
            </p>
            <p className="text-sm text-gray-500">MP3, WAV, OGG, WebM supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>

          <button
            onClick={onUpload}
            disabled={loading || !file}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Analyze Recording
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ result }) {
  const m = result.teaching_metrics;

  const speakerData = [
    { name: 'Instructor', value: Math.round(m.talk_ratio), fill: '#14b8a6' },
    { name: 'Students', value: Math.round(100 - m.talk_ratio), fill: '#06b6d4' },
    { name: 'Silence', value: Math.round((m.silence_time / (m.instructor_time + m.student_time + m.silence_time)) * 100), fill: '#e5e7eb' }
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Demo Dashboard</h1>
        <p className="text-gray-600">Upload a recording to see your real metrics - Sample data shown below</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-teal-600 font-semibold hover:text-teal-700">
          Sample Data
        </button>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricBox
          label="TALK RATIO"
          value={`${Math.round(m.talk_ratio)}%`}
          subtitle="Instructor talk time"
          color="teal"
        />
        <MetricBox
          label="QUESTIONS"
          value={m.questions_detected}
          subtitle="Total detected"
          color="blue"
        />
        <MetricBox
          label="AVG WAIT TIME"
          value={`${m.avg_wait_time.toFixed(1)}s`}
          subtitle="After questions"
          color="orange"
        />
        <MetricBox
          label="LECTURE PACE"
          value={`${Math.round(m.lecture_pace)} wpm`}
          subtitle="Words per minute"
          color="pink"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">
        {/* Speaker Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Speaker distribution</h3>
          <div className="mb-4">
            <div className="flex gap-1">
              <div style={{ width: '68%' }} className="h-8 bg-teal-500 rounded-l"></div>
              <div style={{ width: '20%' }} className="h-8 bg-cyan-500"></div>
              <div style={{ width: '12%' }} className="h-8 bg-gray-300 rounded-r"></div>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>■ Instructor 68%</span>
              <span>■ Students 20%</span>
              <span>■ Silence 12%</span>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Instructor questions</span>
              <span className="font-bold text-teal-600">14</span>
              <span className="text-teal-600 text-xs">Good</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Student responses</span>
              <span className="font-bold text-cyan-600">6</span>
              <span className="text-cyan-600 text-xs">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Engagement score</span>
              <span className="font-bold text-teal-600">74/100</span>
              <span className="text-teal-600 text-xs">Good</span>
            </div>
          </div>
        </div>

        {/* Teaching Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Teaching metrics</h3>
          <div className="space-y-4">
            <MetricRow label="Speech clarity" value="87%" status="Excellent" color="green" />
            <MetricRow label="Pacing (120-135 ideal)" value="142 wpm" status="Fast" color="orange" />
            <MetricRow label="Wait time (5-7s ideal)" value="3.2s" status="Improve" color="red" />
            <MetricRow label="Content coverage" value="91%" status="On Track" color="green" />
            <MetricRow label="Interaction rate" value="1/min" status="Regular" color="blue" />
            <MetricRow label="Student questions" value="6" status="Engaged" color="green" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricsView({ result }) {
  const m = result.teaching_metrics;

  const chartData = [
    { name: 'Clarity', value: m.speech_clarity },
    { name: 'Coverage', value: m.content_coverage },
    { name: 'Engagement', value: m.engagement_score },
    { name: 'Interaction', value: Math.min(m.interaction_rate * 20, 100) }
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Detailed Metrics</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Scores</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="value" fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Time Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Instructor Time</span>
                <span className="font-bold text-gray-800">{m.instructor_time.toFixed(0)}s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div style={{ width: `${(m.instructor_time / (m.instructor_time + m.student_time)) * 100}%` }} className="bg-teal-500 h-3 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Student Time</span>
                <span className="font-bold text-gray-800">{m.student_time.toFixed(0)}s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div style={{ width: `${(m.student_time / (m.instructor_time + m.student_time)) * 100}%` }} className="bg-cyan-500 h-3 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightsView({ result }) {
  const s = result.ai_summary;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Insights</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{s.session_title}</h2>
          <p className="text-gray-600 text-lg">{s.overview}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">✓ Strengths</h3>
            <ul className="space-y-2">
              {s.strengths.map((str, i) => (
                <li key={i} className="text-gray-700">• {str}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⚠️ Improvements</h3>
            <ul className="space-y-2">
              {s.improvements.map((imp, i) => (
                <li key={i} className="text-gray-700">• {imp}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📚 Key Topics</h3>
          <div className="flex flex-wrap gap-2">
            {s.key_topics.map((topic, i) => (
              <span key={i} className="px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💡 Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-bold text-teal-600 mt-1">{i + 1}</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SessionsView({ sessions, onLoadSession }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Sessions</h1>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No sessions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">File Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, i) => (
                <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800">{session.filename}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(session.timestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-600">{(session.duration / 60).toFixed(1)}m</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onLoadSession(JSON.parse(session.metrics) ? session : null)}
                      className="text-teal-600 hover:text-teal-700 font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function MetricBox({ label, value, subtitle, color }) {
  const colors = {
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', line: 'bg-teal-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', line: 'bg-blue-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', line: 'bg-orange-500' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600', line: 'bg-pink-500' }
  };

  const c = colors[color];

  return (
    <div className={`${c.bg} rounded-lg p-4 border border-gray-200`}>
      <p className="text-xs font-bold text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${c.text} mb-1`}>{value}</p>
      <div className={`h-1 w-12 ${c.line} rounded-full`}></div>
      <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}

function MetricRow({ label, value, status, color }) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-bold text-gray-800">{value}</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${colors[color]}`}>{status}</span>
      </div>
    </div>
  );
}

export default ClassPulseFrontend;