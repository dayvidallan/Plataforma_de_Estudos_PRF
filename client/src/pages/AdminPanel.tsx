import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

export default function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [expandedMission, setExpandedMission] = useState<number | null>(null);
  const [showRoundForm, setShowRoundForm] = useState(false);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);

  // Fetch data
  const { data: rounds, isLoading: roundsLoading } = trpc.course.getRounds.useQuery();
  const { data: missions } = trpc.course.getMissionsByRoundId.useQuery(
    { roundId: expandedRound || 0 },
    { enabled: expandedRound !== null }
  );
  const { data: topics } = trpc.course.getTopicsByMissionId.useQuery(
    { missionId: expandedMission || 0 },
    { enabled: expandedMission !== null }
  );

  // Mutations
  const createRoundMutation = trpc.admin.createRound.useMutation({
    onSuccess: () => {
      setFormData({ name: '', description: '' });
      setShowRoundForm(false);
      void trpc.useUtils().course.getRounds.invalidate();
    },
  });

  const createMissionMutation = trpc.admin.createMission.useMutation({
    onSuccess: () => {
      setFormData({ name: '', description: '' });
      setShowMissionForm(false);
      void trpc.useUtils().course.getMissionsByRoundId.invalidate();
    },
  });

  const createTopicMutation = trpc.admin.createTopic.useMutation({
    onSuccess: () => {
      setFormData({ name: '', description: '' });
      setShowTopicForm(false);
      void trpc.useUtils().course.getTopicsByMissionId.invalidate();
    },
  });

  const deleteRoundMutation = trpc.admin.deleteRound.useMutation({
    onSuccess: () => {
      void trpc.useUtils().course.getRounds.invalidate();
    },
  });

  const deleteMissionMutation = trpc.admin.deleteMission.useMutation({
    onSuccess: () => {
      void trpc.useUtils().course.getMissionsByRoundId.invalidate();
    },
  });

  const deleteTopicMutation = trpc.admin.deleteTopic.useMutation({
    onSuccess: () => {
      void trpc.useUtils().course.getTopicsByMissionId.invalidate();
    },
  });

  // Check if user is admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">Você precisa ser administrador para acessar esta página.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  if (roundsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const handleCreateRound = () => {
    if (formData.name.trim()) {
      createRoundMutation.mutate({
        name: formData.name,
        description: formData.description,
      });
    }
  };

  const handleCreateMission = () => {
    if (formData.name.trim() && selectedRoundId) {
      createMissionMutation.mutate({
        roundId: selectedRoundId,
        name: formData.name,
        description: formData.description,
      });
    }
  };

  const handleCreateTopic = () => {
    if (formData.name.trim() && selectedMissionId) {
      createTopicMutation.mutate({
        missionId: selectedMissionId,
        name: formData.name,
        description: formData.description,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel de Administração</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/course')}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            Voltar para Curso
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Rodadas Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Rodadas</h2>
              <Button
                onClick={() => {
                  setShowRoundForm(!showRoundForm);
                  setFormData({ name: '', description: '' });
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Rodada
              </Button>
            </div>

            {showRoundForm && (
              <div className="bg-gray-700 rounded p-4 mb-6 space-y-3">
                <input
                  type="text"
                  placeholder="Nome da Rodada"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="Descrição (opcional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateRound}
                    disabled={createRoundMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {createRoundMutation.isPending ? 'Criando...' : 'Criar Rodada'}
                  </Button>
                  <Button
                    onClick={() => setShowRoundForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {rounds?.map((round) => (
                <div key={round.id} className="border border-gray-700 rounded overflow-hidden">
                  <div className="bg-gray-700 p-4 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setExpandedRound(expandedRound === round.id ? null : round.id);
                        setExpandedMission(null);
                      }}
                      className="flex items-center gap-2 flex-1 text-left hover:text-blue-400"
                    >
                      {expandedRound === round.id ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                      <span className="font-semibold">{round.name}</span>
                    </button>
                    <Button
                      onClick={() => deleteRoundMutation.mutate({ roundId: round.id })}
                      disabled={deleteRoundMutation.isPending}
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-600 hover:bg-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {expandedRound === round.id && (
                    <div className="bg-gray-750 p-4 space-y-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Missões ({missions?.length || 0})</h3>
                        <Button
                          onClick={() => {
                            setSelectedRoundId(round.id);
                            setShowMissionForm(!showMissionForm);
                            setFormData({ name: '', description: '' });
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Nova Missão
                        </Button>
                      </div>

                      {showMissionForm && selectedRoundId === round.id && (
                        <div className="bg-gray-700 rounded p-4 space-y-3">
                          <input
                            type="text"
                            placeholder="Nome da Missão"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          />
                          <textarea
                            placeholder="Descrição (opcional)"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCreateMission}
                              disabled={createMissionMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {createMissionMutation.isPending ? 'Criando...' : 'Criar Missão'}
                            </Button>
                            <Button
                              onClick={() => setShowMissionForm(false)}
                              variant="outline"
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {missions?.map((mission) => (
                          <div key={mission.id} className="bg-gray-700 rounded p-3">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setExpandedMission(expandedMission === mission.id ? null : mission.id);
                                }}
                                className="flex items-center gap-2 flex-1 text-left hover:text-blue-400"
                              >
                                {expandedMission === mission.id ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                                <span>{mission.name}</span>
                              </button>
                              <Button
                                onClick={() => deleteMissionMutation.mutate({ missionId: mission.id })}
                                disabled={deleteMissionMutation.isPending}
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-600 hover:bg-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {expandedMission === mission.id && (
                              <div className="mt-3 ml-4 space-y-3 border-t border-gray-600 pt-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Tópicos ({topics?.length || 0})</span>
                                  <Button
                                    onClick={() => {
                                      setSelectedMissionId(mission.id);
                                      setShowTopicForm(!showTopicForm);
                                      setFormData({ name: '', description: '' });
                                    }}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Novo Tópico
                                  </Button>
                                </div>

                                {showTopicForm && selectedMissionId === mission.id && (
                                  <div className="bg-gray-600 rounded p-3 space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Nome do Tópico"
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                      className="w-full px-3 py-2 bg-gray-500 rounded border border-gray-400 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                    <textarea
                                      placeholder="Descrição (opcional)"
                                      value={formData.description}
                                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                      className="w-full px-3 py-2 bg-gray-500 rounded border border-gray-400 text-white placeholder-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={handleCreateTopic}
                                        disabled={createTopicMutation.isPending}
                                        size="sm"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        {createTopicMutation.isPending ? 'Criando...' : 'Criar'}
                                      </Button>
                                      <Button
                                        onClick={() => setShowTopicForm(false)}
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  {topics?.map((topic) => (
                                    <div key={topic.id} className="bg-gray-600 rounded p-2 flex items-center justify-between text-sm">
                                      <span>{topic.name}</span>
                                      <Button
                                        onClick={() => deleteTopicMutation.mutate({ topicId: topic.id })}
                                        disabled={deleteTopicMutation.isPending}
                                        size="sm"
                                        variant="outline"
                                        className="text-red-400 border-red-600 hover:bg-red-900"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
