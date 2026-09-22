import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAllOrganizations, useProgramsByOrganization, useOrganizationsByOwner } from '../hooks/useVouchera';
import ProgramCard from '../components/ProgramCard';

function OrgPrograms({ orgId, orgName }: { orgId: bigint; orgName: string }) {
  const { data: programs, isLoading } = useProgramsByOrganization(orgId);

  if (isLoading) return <div className="spinner" style={{ margin: '1rem auto', display: 'block' }}></div>;
  if (!programs || programs.length === 0) return null;

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
          🏛️ {orgName}
        </h3>
        <Link to={`/organizations/${orgId}`} style={{ fontSize: '0.85rem' }}>
          View Organization &rarr;
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3">
        {programs.map(p => (
          <ProgramCard key={p.id.toString()} program={p} />
        ))}
      </div>
    </div>
  );
}

export default function Programs() {
  const { address, isConnected } = useAccount();
  const { data: orgs, isLoading: orgsLoading } = useAllOrganizations();
  const { data: myOrgs } = useOrganizationsByOwner(address);

  const hasMyOrgs = myOrgs && myOrgs.length > 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title" style={{ margin: '0 0 0.25rem 0' }}>Subsidy Programs</h1>
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: '0.9rem' }}>
            Explore funded voucher pools across all verified organizations on Bohr blockchain.
          </p>
        </div>

        {isConnected && hasMyOrgs && (
          <Link to={`/organizations/${myOrgs[0].id}?tab=programs`} className="btn btn-primary">
            + Create Program for {myOrgs[0].name}
          </Link>
        )}
      </div>

      {orgsLoading ? (
        <div className="spinner" style={{ margin: '4rem auto', display: 'block' }}></div>
      ) : orgs && orgs.length > 0 ? (
        orgs.map(org => (
          <OrgPrograms key={org.id.toString()} orgId={org.id} orgName={org.name} />
        ))
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>📂</span>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No Programs Created Yet</h3>
          <p style={{ color: 'var(--color-muted)', maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
            A program is the category-locked funding container from which restricted subsidy vouchers are allocated to beneficiaries.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/organizations" className="btn btn-primary">
              Browse Organizations &rarr;
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary">
              Learn How Programs Work
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
