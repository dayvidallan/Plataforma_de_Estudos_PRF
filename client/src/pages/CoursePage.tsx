import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, Loader2, Upload, Send, FileText, X } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

export default function CoursePage() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [expandedRound, setExpandedRound] = useState<number | null>(1);
  const [expandedMission, setExpandedMission] = useState<number | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localProgress, setLocalProgress] = useState<Set<number>>(new Set());
  const [localComments, setLocalComments] = useState<Map<number, Array<any>>>(new Map());

  // Fetch rounds
  const { data: rounds, isLoading: roundsLoading } = trpc.course.getRounds.useQuery();

  // Fetch missions for selected round
  const { data: missions } = trpc.course.getMissionsByRoundId.useQuery(
    { roundId: expandedRound || 0 },
    { enabled: expandedRound !== null }
  );

  // Fetch topics for selected mission
  const { data: topics } = trpc.course.getTopicsByMissionId.useQuery(
    { missionId: expandedMission || 0 },
    { enabled: expandedMission !== null }
  );

  // Fetch user progress
  const { data: userProgress } = trpc.course.getUserProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch round progress
  const { data: roundProgress } = trpc.course.getRoundProgress.useQuery(
    { roundId: expandedRound || 0 },
    { enabled: expandedRound !== null && isAuthenticated }
  );

  // Fetch attachments for selected topic
  const { data: attachments, refetch: refetchAttachments } = trpc.course.getAttachmentsByTopicId.useQuery(
    { topicId: expandedTopic || 0 },
    { enabled: expandedTopic !== null }
  );

  // Fetch comments for selected mission
  const { data: comments } = trpc.course.getCommentsByMissionId.useQuery(
    { missionId: expandedMission || 0 },
    { enabled: expandedMission !== null }
  );

  // Toggle topic progress mutation
  const toggleProgressMutation = trpc.course.toggleTopicProgress.useMutation({
    onSuccess: () => {
      void trpc.useUtils().course.getUserProgress.invalidate();
      void trpc.useUtils().course.getRoundProgress.invalidate();
    },
  });

  // Add comment mutation
  const addCommentMutation = trpc.course.addComment.useMutation({
    onSuccess: () => {
      setCommentText('');
      void trpc.useUtils().course.getCommentsByMissionId.invalidate();
    },
  });

  const handleToggleProgress = (topicId: number) => {
    // Optimistic update
    const newProgress = new Set(localProgress);
    if (newProgress.has(topicId)) {
      newProgress.delete(topicId);
    } else {
      newProgress.add(topicId);
    }
    setLocalProgress(newProgress);

    // Send mutation
    toggleProgressMutation.mutate({ topicId });
  };

  const handleAddComment = () => {
    if (commentText.trim() && expandedMission) {
      // Optimistic update
      const newComments = new Map(localComments);
      const missionComments = newComments.get(expandedMission) || [];
      missionComments.push({
        id: Math.random(),
        content: commentText,
        userId: user?.id,
        createdAt: new Date(),
      });
      newComments.set(expandedMission, missionComments);
      setLocalComments(newComments);

      // Send mutation
      addCommentMutation.mutate({
        missionId: expandedMission,
        content: commentText,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !expandedTopic || !isAuthenticated) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('topicId', expandedTopic.toString());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await refetchAttachments();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        alert('Arquivo enviado com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro ao fazer upload: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const isTopicCompleted = (topicId: number) => {
    // Check local optimistic update first
    if (localProgress.has(topicId)) {
      return true;
    }
    // Then check server state
    return userProgress?.some(p => p.topicId === topicId && p.completed === 1) || false;
  };

  const getDisplayComments = () => {
    if (!expandedMission) return [];
    const localMissionComments = localComments.get(expandedMission) || [];
    const serverComments = comments || [];
    return [...localMissionComments, ...serverComments];
  };

  if (roundsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">Você precisa estar autenticado para acessar a plataforma.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Plataforma de Estudos PRF</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Bem-vindo, {user?.name || 'Usuário'}</span>
            {user?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="text-blue-400 border-blue-600 hover:bg-blue-900"
              >
                Admin
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Rodadas */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Rodadas</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {rounds?.map((round) => (
                  <div key={round.id} className="space-y-2">
                    <button
                      onClick={() => {
                        setExpandedRound(expandedRound === round.id ? null : round.id);
                        setExpandedMission(null);
                        setExpandedTopic(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded transition-colors text-sm ${
                        expandedRound === round.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {round.name}
                    </button>
                    {expandedRound === round.id && roundProgress && (
                      <div className="px-3 py-2 bg-gray-700 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300">Progresso</span>
                          <span className="text-blue-400 font-semibold">{roundProgress.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${roundProgress.percentage}%` }}
                          />
                        </div>
                        <div className="text-gray-400 mt-1 text-xs">
                          {roundProgress.completedTopics} / {roundProgress.totalTopics} tópicos
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {expandedRound && missions && (
              <>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {rounds?.find(r => r.id === expandedRound)?.name}
                  </h2>

                  <div className="space-y-4">
                    {missions.map((mission) => (
                      <div key={mission.id} className="border border-gray-700 rounded-lg overflow-hidden">
                        {/* Mission Header */}
                        <button
                          onClick={() => {
                            setExpandedMission(expandedMission === mission.id ? null : mission.id);
                            setExpandedTopic(null);
                          }}
                          className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-between"
                        >
                          <span className="font-semibold">{mission.name}</span>
                          {expandedMission === mission.id ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>

                        {/* Mission Content */}
                        {expandedMission === mission.id && (
                          <div className="p-4 bg-gray-750 space-y-4">
                            {/* Topics */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Tópicos ({topics?.length || 0})</h3>
                              <div className="space-y-3">
                                {topics?.map((topic) => (
                                  <div key={topic.id} className="border border-gray-600 rounded p-3">
                                    {/* Topic Header */}
                                    <div className="flex items-start gap-3">
                                      <Checkbox
                                        checked={isTopicCompleted(topic.id)}
                                        onCheckedChange={() => handleToggleProgress(topic.id)}
                                        className="mt-1"
                                      />
                                      <button
                                        onClick={() => {
                                          setExpandedTopic(expandedTopic === topic.id ? null : topic.id);
                                        }}
                                        className="flex-1 text-left hover:text-blue-400 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          {expandedTopic === topic.id ? (
                                            <ChevronDown className="w-4 h-4" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4" />
                                          )}
                                          <span>{topic.name}</span>
                                        </div>
                                      </button>
                                    </div>

                                    {/* Topic Details */}
                                    {expandedTopic === topic.id && (
                                      <div className="mt-4 ml-8 space-y-4 border-t border-gray-600 pt-4">
                                        {/* Materials Section */}
                                        <div>
                                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Materiais ({attachments?.length || 0})
                                          </h4>
                                          <div className="space-y-2">
                                            {attachments && attachments.length > 0 ? (
                                              attachments.map((attachment) => (
                                                <a
                                                  key={attachment.id}
                                                  href={attachment.fileUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="block p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-blue-400 truncate"
                                                >
                                                  📄 {attachment.fileName}
                                                </a>
                                              ))
                                            ) : (
                                              <p className="text-gray-400 text-sm">Nenhum material disponível</p>
                                            )}
                                          </div>
                                          <div className="mt-3">
                                            <input
                                              ref={fileInputRef}
                                              type="file"
                                              onChange={handleFileUpload}
                                              disabled={uploadingFile}
                                              className="hidden"
                                            />
                                            <Button
                                              onClick={() => fileInputRef.current?.click()}
                                              disabled={uploadingFile}
                                              className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                              {uploadingFile ? (
                                                <>
                                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                  Enviando...
                                                </>
                                              ) : (
                                                <>
                                                  <Upload className="w-4 h-4 mr-2" />
                                                  Adicionar Arquivo
                                                </>
                                              )}
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Comments Section */}
                                        <div>
                                          <h4 className="font-semibold mb-2">Comentários ({getDisplayComments().length})</h4>
                                          <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                                            {getDisplayComments().length > 0 ? (
                                              getDisplayComments().map((comment) => (
                                                <div key={comment.id} className="p-2 bg-gray-700 rounded text-sm">
                                                  <p className="text-gray-300">{comment.content}</p>
                                                  <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(comment.createdAt).toLocaleString('pt-BR')}
                                                  </p>
                                                </div>
                                              ))
                                            ) : (
                                              <p className="text-gray-400 text-sm">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                                            )}
                                          </div>
                                          <div className="flex gap-2">
                                            <input
                                              type="text"
                                              value={commentText}
                                              onChange={(e) => setCommentText(e.target.value)}
                                              onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                  handleAddComment();
                                                }
                                              }}
                                              placeholder="Adicione um comentário..."
                                              className="flex-1 px-3 py-2 bg-gray-700 rounded border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                            />
                                            <Button
                                              onClick={handleAddComment}
                                              disabled={addCommentMutation.isPending}
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              <Send className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
