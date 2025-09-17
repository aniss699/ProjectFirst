
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { dataApi } from '@/lib/api/services';

export default function MissionDetailDebug() {
  const params = useParams();
  const missionId = params.id;

  console.log('🔍 DEBUG - Params:', params);
  console.log('🔍 DEBUG - Mission ID:', missionId);

  const { data: mission, isLoading, error } = useQuery({
    queryKey: ['debug-mission', missionId],
    queryFn: async () => {
      console.log('🔍 DEBUG - Fetching mission:', missionId);
      const result = await dataApi.getMissionById(missionId!);
      console.log('🔍 DEBUG - Mission fetched:', result);
      return result;
    },
    enabled: !!missionId,
  });

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading mission {missionId}...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error loading mission</h1>
        <p>Mission ID: {missionId}</p>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!mission) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>No mission found</h1>
        <p>Mission ID: {missionId}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>DEBUG - Mission Detail</h1>
      <h2>{mission.title}</h2>
      <p>ID: {mission.id}</p>
      <p>Description: {mission.description}</p>
      <p>Budget: {mission.budgetDisplay}</p>
      <p>Client: {mission.clientName}</p>
      <p>Bids: {mission.bids?.length || 0}</p>
      
      <h3>Raw Mission Data:</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
        {JSON.stringify(mission, null, 2)}
      </pre>
    </div>
  );
}
