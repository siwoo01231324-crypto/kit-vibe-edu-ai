import { InsightsContent } from './InsightsContent';

export default async function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div className="max-w-4xl mx-auto p-6"><InsightsContent sessionId={id} /></div>;
}
