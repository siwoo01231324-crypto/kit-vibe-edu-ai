import { createClient } from '@/lib/supabase/server';

interface Props {
  sessionId: string;
}

export async function ThumbsFeedbackPanel({ sessionId }: Props) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('thumbs_feedback')
    .select('nickname, type, comment, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  const feedbacks = data ?? [];
  const withComment = feedbacks.filter((f) => f.comment);

  if (feedbacks.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-800">학생 피드백</h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">총 {feedbacks.length}명 응답</span>
          <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-700 font-medium text-xs">
            👍 {feedbacks.filter((f) => f.type === 'up').length}명
          </span>
        </div>
      </div>

      {withComment.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">어려웠던 점</p>
          <ul className="space-y-2">
            {withComment.map((f, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3">
                <span className="shrink-0 text-xs font-semibold text-slate-400 mt-0.5">{f.nickname}</span>
                <p className="text-sm text-slate-700 flex-1">{f.comment}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {withComment.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-2">작성된 코멘트가 없습니다.</p>
      )}
    </div>
  );
}
