
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { dataApi } from '@/lib/api/services';

export default function MissionDetailSimple() {
  const { user } = useAuth();
  const params = useParams();
  const missionId = params.id;

  console.log('🔍 Simple Mission Detail - ID:', missionId);

  const { data: mission, isLoading, error } = useQuery({
    queryKey: ['mission-simple', missionId],
    queryFn: () => dataApi.getMissionById(missionId!),
    enabled: !!missionId && missionId !== 'undefined'
  });

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Chargement...</h1>
        <p>Mission ID: {missionId}</p>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Erreur</h1>
        <p>Mission ID: {missionId}</p>
        <p>Error: {error instanceof Error ? error.message : 'Mission non trouvée'}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Mission Simple: {mission.title}</h1>
      <p>ID: {mission.id}</p>
      <p>Description: {mission.description}</p>
      <p>Budget: {mission.budgetDisplay}</p>
      <p>Client: {mission.clientName}</p>
      <p>Offres: {mission.bids?.length || 0}</p>
    </div>
  );
}
