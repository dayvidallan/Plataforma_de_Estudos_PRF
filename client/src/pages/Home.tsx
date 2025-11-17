import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">{APP_TITLE}</h1>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Bem-vindo, {user?.name}!</span>
                <Button onClick={() => navigate("/course")} variant="default">
                  Ir para o Curso\n                </Button>
                <Button onClick={logout} variant="outline">
                  Sair
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()} variant="default">
                Fazer Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16 text-white">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4">Bem-vindo à Plataforma de Estudos PRF</h2>
          <p className="text-xl text-blue-100 mb-8">
            Sistema completo de aprendizado com 5 fases implementadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Fase 1: CRUD de Admin</h3>
            <p className="text-blue-100 mb-4">
              Permissões de administrador para criar, editar e excluir rodadas, missões e tópicos.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Fase 2: Anexos por Tópico</h3>
            <p className="text-blue-100 mb-4">
              Sistema de anexos movido de missão para tópico com gerenciamento completo.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Fase 3: Progresso por Rodada</h3>
            <p className="text-blue-100 mb-4">
              Cálculo inteligente de progresso agregado por rodada.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Fase 4: Atualizações em Tempo Real</h3>
            <p className="text-blue-100 mb-4">
              Otimistic updates para feedback instantâneo do usuário.
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur p-6 rounded-lg md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Fase 5: Admin Panel</h3>
            <p className="text-blue-100 mb-4">
              Interface completa de gerenciamento para administradores.
            </p>
          </div>
        </div>

        <div className="text-center">
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/course")}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
            >
              Acessar o Curso Agora
            </Button>
          ) : (
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3"
            >
              Fazer Login para Começar
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
