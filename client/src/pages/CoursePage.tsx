import { useState, useRef, useMemo } from 'react';
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
  const { data: comments, refetch: refetchComments } = trpc.course.getCommentsByMissionId.useQuery(
    { missionId: expandedMission || 0 },
    { enabled: expandedMission !== null }
  );

  // Toggle topic progress mutation with optimistic update
  const toggleProgressMutation = trpc.course.toggleTopicProgress.useMutation({
    onMutate: async ({ topicId }) => {
      // Cancel outgoing refetches
      await trpc.useUtils().course.getUserProgress.cancel();
      
      // Get previous data
      const previousProgress = trpc.useUtils().course.getUserProgress.getData();
      
      // Optimistically update the cache
      if (previousProgress) {
        const isCompleted = previousProgress.some(p => p.topicId === topicId && p.completed === 1);
        const updated = isCompleted
          ? previousProgress.filter(p => !(p.topicId === topicId && p.completed === 1))
          : [...previousProgress, { id: Math.random(), userId: user?.id || 0, topicId, completed: 1, completedAt: new Date(), createdAt: new Date(), updatedAt: new Date() }];
        
        trpc.useUtils().course.getUserProgress.setData(undefined, updated);
      }
      
      return { previousProgress };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        trpc.useUtils().course.getUserProgress.setData(undefined, context.previousProgress);
      }
    },
    onSuccess: () => {
      // Refetch to confirm
      void trpc.useUtils().course.getUserProgress.invalidate();
      void trpc.useUtils().course.getRoundProgress.invalidate();
    },
  });

  // Add comment mutation with optimistic update
  const addCommentMutation = trpc.course.addComment.useMutation({
    onMutate: async (newComment) => {
      await trpc.useUtils().course.getCommentsByMissionId.cancel();
      const previousComments = trpc.useUtils().course.getCommentsByMissionId.getData({ missionId: expandedMission || 0 });
      
      if (previousComments) {
        const optimisticComment = {
          id: Math.random(),
          missionId: newComment.missionId,
          userId: user?.id || 0,
          content: newComment.content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        trpc.useUtils().course.getCommentsByMissionId.setData({ missionId: expandedMission || 0 }, [...previousComments, optimisticComment]);
      }
      
      return { previousComments };
    },
    onError: (err, newData, context) => {
      if (context?.previousComments) {
        trpc.useUtils().course.getCommentsByMissionId.setData({ missionId: expandedMission || 0 }, context.previousComments);
      }
    },
    onSuccess: () => {
      setCommentText('');
      void trpc.useUtils().course.getCommentsByMissionId.invalidate();
    },
  });

  const handleToggleProgress = (topicId: number) => {
    toggleProgressMutation.mutate({ topicId });
  };

  const handleAddComment = () => {
    if (commentText.trim() && expandedMission) {
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
      } else {
        alert('Erro ao fazer upload do arquivo');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload do arquivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const isTopicCompleted = (topicId: number) => {
    return userProgress?.some(p => p.topicId === topicId && p.completed === 1) || false;
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
            <span className="text-sm text-gray-400">Bem-vindo, {user?.name}</span>
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
                          onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}
                          className="w-full bg-gray-700 hover:bg-gray-600 transition-colors px-6 py-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {expandedMission === mission.id ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                            <span className="font-semibold text-lg">{mission.name}</span>
                          </div>
                        </button>

                        {/* Mission Content */}
                        {expandedMission === mission.id && topics && (
                          <div className="bg-gray-800 p-6 space-y-6">
                            {/* Topics with Checkboxes */}
                            <div className="space-y-3">
                              <h3 className="font-semibold text-gray-300 mb-4">Tópicos ({topics.length})</h3>
                              {topics.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                  {topics.map((topic) => (
                                    <div key={topic.id} className="border border-gray-600 rounded">
                                      {/* Topic Header */}
                                      <button
                                        onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                                        className="w-full flex items-start gap-3 p-3 bg-gray-700 hover:bg-gray-600 transition-colors"
                                      >
                                        {isAuthenticated ? (
                                          <Checkbox
                                            checked={isTopicCompleted(topic.id)}
                                            onCheckedChange={() => handleToggleProgress(topic.id)}
                                            disabled={toggleProgressMutation.isPending}
                                            className="mt-1"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        ) : (
                                          <div className="w-5 h-5 border border-gray-500 rounded mt-1" />
                                        )}
                                        <div className="flex-1 text-left">
                                          <span className={`${isTopicCompleted(topic.id) ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                                            {topic.name}
                                          </span>
                                        </div>
                                        {expandedTopic === topic.id ? (
                                          <ChevronDown className="w-4 h-4 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-gray-400" />
                                        )}
                                      </button>

                                      {/* Topic Content */}
                                      {expandedTopic === topic.id && (
                                        <div className="bg-gray-900 p-4 space-y-4 border-t border-gray-600">
                                          {/* Attachments Section */}
                                          <div>
                                            <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                              <FileText className="w-4 h-4" />
                                              Materiais ({attachments?.length || 0})
                                            </h4>
                                            
                                            {/* Upload Section */}
                                            {isAuthenticated && (
                                              <div className="mb-3">
                                                <input
                                                  ref={fileInputRef}
                                                  type="file"
                                                  onChange={handleFileUpload}
                                                  disabled={uploadingFile}
                                                  className="hidden"
                                                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                                                />
                                                <Button
                                                  onClick={() => fileInputRef.current?.click()}
                                                  disabled={uploadingFile}
                                                  className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                                >
                                                  {uploadingFile ? (
                                                    <>
                                                      <Loader2 className="w-4 h-4 animate-spin" />
                                                      Enviando...
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Upload className="w-4 h-4" />
                                                      Adicionar Arquivo
                                                    </>
                                                  )}
                                                </Button>
                                              </div>
                                            )}

                                            {/* Attachments List */}
                                            {attachments && attachments.length > 0 ? (
                                              <div className="space-y-2">
                                                {attachments.map((attachment) => (
                                                  <a
                                                    key={attachment.id}
                                                    href={attachment.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                                                  >
                                                    <FileText className="w-4 h-4 text-blue-400" />
                                                    <div className="flex-1">
                                                      <p className="text-sm font-medium text-gray-100">{attachment.fileName}</p>
                                                      <p className="text-xs text-gray-400">
                                                        {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(2)} KB` : 'Tamanho desconhecido'}
                                                      </p>
                                                    </div>
                                                  </a>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="bg-gray-700 rounded p-3 text-center text-gray-400 text-sm">
                                                <p>Nenhum material disponível</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-400 italic">Nenhum tópico disponível</p>
                              )}
                            </div>

                            {/* Comments Section */}
                            <div className="border-t border-gray-700 pt-6">
                              <h3 className="font-semibold text-gray-300 mb-4">Comentários ({comments?.length || 0})</h3>

                              {isAuthenticated ? (
                                <div className="space-y-4">
                                  {/* Comment Input */}
                                  <div className="flex gap-3">
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
                                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                    />
                                    <Button
                                      onClick={handleAddComment}
                                      disabled={addCommentMutation.isPending || !commentText.trim()}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* Comments List */}
                                  {comments && comments.length > 0 ? (
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                      {comments.map((comment) => (
                                        <div key={comment.id} className="bg-gray-700 rounded p-4">
                                          <div className="flex items-start justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-100">Usuário</span>
                                            <span className="text-xs text-gray-400">
                                              {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-300">{comment.content}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="bg-gray-700 rounded p-4 text-center text-gray-400 text-sm">
                                      <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="bg-gray-700 rounded p-4 text-center text-gray-400 text-sm">
                                  <p>Faça login para comentar</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!expandedRound && (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg">Selecione uma Rodada no menu lateral para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
