import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { VOUCHERA_ABI, VOUCHERA_CONTRACT_ADDRESS } from '../config/contracts';
import { useProtocolAdmin, useOrganizationThreshold, useAllOrganizations } from '../hooks/useVouchera';
import TransactionStatus from '../components/TransactionStatus';
import { useQueryClient } from '@tanstack/react-query';
import { formatAddress } from '../utils/formatting';

export default function AdminDashboard() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { data: admin } = useProtocolAdmin();
  const { data: threshold } = useOrganizationThreshold();
  const { data: orgs } = useAllOrganizations();

  const [newThreshold, setNewThreshold] = useState('');
  const [activityUser, setActivityUser] = useState('');
  const [activityAmount, setActivityAmount] = useState('');

  const { writeContract: writeThreshold, data: hashThresh, isPending: pendingThresh, error: errThresh } = useWriteContract();
  const { writeContract: writeActivity, data: hashAct, isPending: pendingAct, error: errAct } = useWriteContract();

  const isAdmin = address && admin && address.toLowerCase() === admin.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--color-danger)' }}>Unauthorized Access</h2>
        <p>You must be the Protocol Admin to view this page.</p>
      </div>
    );
  }

  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreshold) return;
    writeThreshold({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'setOrganizationCreationThreshold',
      args: [BigInt(newThreshold)],
    });
  };

  const handleRecordActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityUser || !activityAmount) return;
    writeActivity({
      address: VOUCHERA_CONTRACT_ADDRESS,
      abi: VOUCHERA_ABI,
      functionName: 'recordActivity',
      args: [activityUser as `0x${string}`, BigInt(activityAmount)],
    });
  };

  return (
    <div>
      <h1 className="section-title">Admin Dashboard</h1>

      <div className="grid md:grid-cols-2">
        <div className="card">
          <h2>Protocol Settings</h2>
          <p><strong>Current Threshold:</strong> {threshold?.toString()}</p>
          <form onSubmit={handleUpdateThreshold} style={{ marginTop: '1.5rem' }}>
            <label className="label">Update Threshold</label>
            <input 
              type="number" 
              className="input" 
              value={newThreshold} 
              onChange={e => setNewThreshold(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-warning" disabled={pendingThresh}>Update Threshold</button>
            <TransactionStatus hash={hashThresh} isPending={pendingThresh} error={errThresh} onSuccess={() => queryClient.invalidateQueries()} />
          </form>
        </div>

        <div className="card">
          <h2>Record User Activity</h2>
          <form onSubmit={handleRecordActivity}>
            <label className="label">User Address</label>
            <input 
              type="text" 
              className="input" 
              value={activityUser} 
              onChange={e => setActivityUser(e.target.value)} 
              placeholder="0x..." 
              required 
            />
            <label className="label">Activity Amount</label>
            <input 
              type="number" 
              className="input" 
              value={activityAmount} 
              onChange={e => setActivityAmount(e.target.value)} 
              required 
            />
            <button type="submit" className="btn btn-warning" disabled={pendingAct}>Record Activity</button>
            <TransactionStatus hash={hashAct} isPending={pendingAct} error={errAct} onSuccess={() => {
              setActivityUser('');
              setActivityAmount('');
              queryClient.invalidateQueries();
            }} />
          </form>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>All Organizations (System View)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '0.5rem' }}>ID</th>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th style={{ padding: '0.5rem' }}>Owner</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orgs?.map(org => (
              <tr key={org.id.toString()} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.5rem' }}>#{org.id.toString()}</td>
                <td style={{ padding: '0.5rem' }}>{org.name}</td>
                <td style={{ padding: '0.5rem' }}>{formatAddress(org.owner)}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span className={`badge ${org.active ? 'badge-success' : 'badge-danger'}`}>
                    {org.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
