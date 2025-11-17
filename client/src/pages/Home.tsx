import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-600">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Bem-vindo, {user?.name}</span>
                <Button variant="outline" onClick={() => logout()}>
                  Sair
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()}>
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Plataforma de Estudos PRF
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Prepare-se para o concurso da Polícia Rodoviária Federal com nossa plataforma completa de estudos.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/course')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Acessar Plataforma de Estudos
          </Button>
        </div>
      </main>
    </div>
  );
}
