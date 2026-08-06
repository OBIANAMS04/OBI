# #37: Advanced Audit Dashboard

```typescript
// frontend/src/pages/AuditDashboard.tsx
export function AuditDashboard() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: null,
    resource: null,
    status: null,
    from: null,
    to: null
  });

  useEffect(() => {
    fetchAuditLogs(filters);
  }, [filters]);

  return (
    <div>
      <h1>Audit Log Dashboard</h1>

      {/* Filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Statistics */}
      <div className="stats">
        <Card title="Total Events" value={logs.length} />
        <Card title="Failed Actions" value={logs.filter(l => l.status === 'FAILED').length} />
        <Card title="Denied Access" value={logs.filter(l => l.status === 'DENIED').length} />
      </div>

      {/* Audit Log Table */}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>User</th>
            <th>Resource</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.action}</td>
              <td>{log.actor}</td>
              <td>{log.resource}</td>
              <td className={log.status.toLowerCase()}>{log.status}</td>
              <td>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Export */}
      <button onClick={() => exportAuditLogs(logs, 'csv')}>Export CSV</button>
    </div>
  );
}
```

**Status:** ✅ COMPLETE
