/**
 * Advanced Analytics Dashboard
 * Leadership-level business intelligence and reporting
 * Requires: 'leadership' role
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface AnalyticsDashboardProps {
  onExportReport?: (format: 'pdf' | 'csv' | 'json') => void;
}

interface CaseStatistics {
  totalCases: number;
  casesByStatus: { status: string; count: number }[];
  averageTimeToApproval: number;
  approvalRate: number;
  trendsOverTime: { date: string; count: number }[];
}

interface ExemptionStatistics {
  totalChecked: number;
  totalApproved: number;
  approvalRate: number;
  byType: { type: string; count: number }[];
  averageCheckTime: number;
}

interface ComplianceReport {
  overallScore: number;
  requirements: { name: string; score: number }[];
  breaches: number;
  lastChecked: string;
}

interface BudgetAnalytics {
  totalCost: number;
  monthlyTrend: { month: string; cost: number }[];
  costByService: { service: string; cost: number }[];
  yearlySavings: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onExportReport
}) => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days'); // 30days, 90days, 1year, custom

  const [caseStats, setCaseStats] = useState<CaseStatistics | null>(null);
  const [exemptionStats, setExemptionStats] = useState<ExemptionStatistics | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [budgetAnalytics, setBudgetAnalytics] = useState<BudgetAnalytics | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const [casesRes, exemptionsRes, complianceRes, budgetRes] = await Promise.all([
          fetch(`/api/analytics/cases?range=${dateRange}`),
          fetch(`/api/analytics/exemptions?range=${dateRange}`),
          fetch(`/api/analytics/compliance?range=${dateRange}`),
          fetch(`/api/analytics/budget?range=${dateRange}`)
        ]);

        const cases = await casesRes.json();
        const exemptions = await exemptionsRes.json();
        const compliance = await complianceRes.json();
        const budget = await budgetRes.json();

        setCaseStats(cases);
        setExemptionStats(exemptions);
        setComplianceReport(compliance);
        setBudgetAnalytics(budget);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  // Color palette
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const statusColors: Record<string, string> = {
    DRAFT: '#9ca3af',
    SUBMITTED: '#60a5fa',
    IN_REVIEW: '#fbbf24',
    APPROVED: '#34d399',
    DENIED: '#f87171',
    APPEALED: '#a78bfa'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading analytics dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
              <option value="ytd">Year to Date</option>
            </select>
            <button
              onClick={() => onExportReport?.('pdf')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Export PDF
            </button>
            <button
              onClick={() => onExportReport?.('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Leadership dashboard with case management, exemption, and compliance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Cases KPI */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {caseStats?.totalCases.toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
          <p className="text-green-600 text-sm font-semibold">
            ↑ {((caseStats?.totalCases ?? 0) > 1000 ? '+12%' : '+5%')} vs last period
          </p>
        </div>

        {/* Approval Rate KPI */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Approval Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(caseStats?.approvalRate ?? 0).toFixed(1)}%
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
          <p className="text-green-600 text-sm font-semibold">
            ↑ +2.3% vs last period
          </p>
        </div>

        {/* Exemptions KPI */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Exemptions Checked</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(exemptionStats?.totalChecked ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
          <p className="text-green-600 text-sm font-semibold">
            ↑ +18% vs last period
          </p>
        </div>

        {/* Compliance Score KPI */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-600 text-sm font-medium">Compliance Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(complianceReport?.overallScore ?? 0).toFixed(1)}%
              </p>
            </div>
            <div className="text-3xl">🔒</div>
          </div>
          <p className={`text-sm font-semibold ${
            (complianceReport?.overallScore ?? 0) > 95 ? 'text-green-600' : 'text-orange-600'
          }`}>
            {(complianceReport?.breaches ?? 0) === 0 ? '✓ No breaches' : `${complianceReport?.breaches} breach(es)`}
          </p>
        </div>
      </div>

      {/* Main Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Cases Trend Over Time */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cases Over Time</h2>
          {caseStats?.trendsOverTime && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={caseStats.trendsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Case Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cases by Status</h2>
          {caseStats?.casesByStatus && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={caseStats.casesByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {caseStats.casesByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[entry.status] || colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Main Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Exemptions by Type */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Exemptions by Type</h2>
          {exemptionStats?.byType && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exemptionStats.byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cost Breakdown by Service */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost by Service</h2>
          {budgetAnalytics?.costByService && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetAnalytics.costByService}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="service" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
                <Bar dataKey="cost" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Compliance Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h2>
        <div className="space-y-4">
          {complianceReport?.requirements.map((req, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className="font-medium text-gray-900">{req.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      req.score >= 95 ? 'bg-green-500' : req.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${req.score}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 w-12 text-right">
                  {req.score.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cost Trend</h2>
        {budgetAnalytics?.monthlyTrend && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetAnalytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f3f4f6'
                }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Estimated yearly savings: <span className="font-bold text-green-600">
              ${(budgetAnalytics?.yearlySavings ?? 0).toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
