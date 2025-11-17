import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CoursePage() {
  const { user } = useAuth();
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  const { data: rounds, isLoading: roundsLoading } = trpc.course.getRounds.useQuery();
  const { data: allProgress } = trpc.course.getAllRoundsProgress.useQuery();

  if (roundsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Plataforma de Estudos PRF</h1>

        <div className="space-y-4">
          {rounds?.map((round) => {
            const progress = allProgress?.find(p => p.roundId === round.id);
            return (
              <Card key={round.id} className="overflow-hidden">
                <div
                  className="p-4 bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition"
                  onClick={() => setExpandedRound(expandedRound === round.id ? null : round.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{round.name}</h2>
                      <p className="text-blue-100">{round.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{progress?.percentage || 0}%</div>
                      <div className="text-sm text-blue-100">
                        {progress?.completedTopics || 0} / {progress?.totalTopics || 0} tópicos
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 bg-blue-400 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${progress?.percentage || 0}%` }}
                    />
                  </div>
                </div>

                {expandedRound === round.id && (
                  <div className="p-4 space-y-4">
                    <RoundMissions roundId={round.id} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoundMissions({ roundId }: { roundId: number }) {
  const [expandedMission, setExpandedMission] = useState<number | null>(null);
  const { data: missions } = trpc.course.getMissionsByRoundId.useQuery({ roundId });

  return (
    <div className="space-y-3">
      {missions?.map((mission) => (
        <Card key={mission.id} className="overflow-hidden">
          <div
            className="p-3 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
            onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}
          >
            <h3 className="text-lg font-semibold">{mission.name}</h3>
            <p className="text-sm text-gray-600">{mission.description}</p>
          </div>

          {expandedMission === mission.id && (
            <div className="p-4 space-y-4 border-t">
              <MissionTopics missionId={mission.id} />
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Comentários</h4>
                <MissionComments missionId={mission.id} />
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function MissionTopics({ missionId }: { missionId: number }) {
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const { data: topics } = trpc.course.getTopicsByMissionId.useQuery({ missionId });
  const { data: userProgress } = trpc.course.getUserProgress.useQuery();

  const toggleProgressMutation = trpc.course.toggleTopicProgress.useMutation({
    onSuccess: () => {
      void trpc.useUtils().course.getUserProgress.invalidate();
      void trpc.useUtils().course.getAllRoundsProgress.invalidate();
    },
  });

  return (
    <div className="space-y-2">
      {topics?.map((topic) => {
        const isCompleted = userProgress?.some(p => p.topicId === topic.id && p.completed === 1);
        return (
          <div key={topic.id} className="p-3 bg-gray-50 rounded border">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isCompleted || false}
                onChange={() => toggleProgressMutation.mutate({ topicId: topic.id })}
                disabled={toggleProgressMutation.isPending}
                className="mt-1 w-5 h-5 cursor-pointer"
              />
              <div
                className="flex-1 cursor-pointer"
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              >
                <h5 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {topic.name}
                </h5>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </div>
            </div>

            {expandedTopic === topic.id && (
              <div className="mt-3 pl-8 border-t pt-3">
                <TopicAttachments topicId={topic.id} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopicAttachments({ topicId }: { topicId: number }) {
  const { data: attachments } = trpc.course.getAttachmentsByTopicId.useQuery({ topicId });

  if (!attachments || attachments.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum anexo disponível</p>;
  }

  return (
    <div>
      <h6 className="text-sm font-semibold mb-2">Anexos:</h6>
      <ul className="space-y-1">
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <a
              href={attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              📎 {attachment.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MissionComments({ missionId }: { missionId: number }) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const { data: comments } = trpc.course.getCommentsByMissionId.useQuery({ missionId });

  const addCommentMutation = trpc.course.addComment.useMutation({
    onSuccess: () => {
      void trpc.useUtils().course.getCommentsByMissionId.invalidate({ missionId });
      setNewComment('');
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({ missionId, content: newComment });
    }
  };

  return (
    <div className="space-y-3">
      {user && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Adicione um comentário..."
            className="flex-1 px-3 py-2 border rounded text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || addCommentMutation.isPending}
            size="sm"
          >
            Enviar
          </Button>
        </div>
      )}

      {comments && comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="p-2 bg-gray-50 rounded text-sm">
              <p className="text-gray-800">{comment.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(comment.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
      )}
    </div>
  );
}
