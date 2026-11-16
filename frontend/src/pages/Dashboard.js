import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = ['#c9a84c','#3b82f6','#22c55e','#ef4444','#a855f7','#f97316'];

const StatCard = ({ label, value, color, icon }) => (
  <div className={`stat-card ${color}`}>
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  );

  const chartData = stats?.monthlyTransactions?.map(t => ({
    name: MONTHS[t._id.month - 1],
    count: t.count
  })) || [];

  const pieData = stats?.categoryStats?.map(c => ({ name: c._id, value: c.count })) || [];

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back — here's what's happening in your library</p>
      </div>
      <div className="page-body">

        <div className="stats-grid">
          <StatCard label="Total Books" value={stats?.totalBooks ?? 0} color="gold"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          />
          <StatCard label="Active Members" value={stats?.totalMembers ?? 0} color="green"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard label="Books Issued" value={stats?.activeLoans ?? 0} color="blue"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>}
          />
          <StatCard label="Overdue Books" value={stats?.overdueLoans ?? 0} color="red"
            icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          />
        </div>

        {/* Extra info row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Copies', value: stats?.totalCopies?.total ?? 0, sub: `${stats?.totalCopies?.available ?? 0} available` },
            { label: 'Books on Loan', value: (stats?.totalCopies?.total ?? 0) - (stats?.totalCopies?.available ?? 0), sub: 'currently checked out' },
            { label: 'Total Fines', value: `₹${stats?.totalFines ?? 0}`, sub: 'accumulated fines' },
          ].map(item => (
            <div key={item.label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          {/* Bar Chart */}
          <div className="card">
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Monthly Transactions</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Book issues over time</p>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={28}>
                  <XAxis dataKey="name" tick={{ fill: '#4a6080', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#4a6080', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, color: '#e8edf5' }} cursor={{ fill: 'rgba(201,168,76,0.08)' }} />
                  <Bar dataKey="count" fill="#c9a84c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state" style={{ padding: 32 }}><p>No transaction data yet</p></div>}
          </div>

          {/* Pie Chart */}
          <div className="card">
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Books by Category</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Collection distribution</p>
            </div>
            {pieData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, color: '#e8edf5' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pieData.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="empty-state" style={{ padding: 32 }}><p>No books added yet</p></div>}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="table-container" style={{ marginTop: 24 }}>
          <div className="table-header">
            <h3>Recent Activity</h3>
          </div>
          {stats?.recentTransactions?.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map(t => (
                  <tr key={t._id}>
                    <td><strong>{t.book?.title}</strong><br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.book?.author}</span></td>
                    <td>{t.member?.name}<br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.member?.memberId}</span></td>
                    <td>
                      <span className={`badge ${t.status === 'Returned' ? 'badge-green' : t.status === 'Overdue' ? 'badge-red' : 'badge-blue'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
              <h3>No transactions yet</h3>
              <p>Issue a book to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
