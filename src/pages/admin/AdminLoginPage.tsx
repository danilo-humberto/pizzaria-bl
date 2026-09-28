import { KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import heroBowl from "../../assets/images/hero-bowl.png";
import fruitBanana from "../../assets/images/fruit-banana.png";
import fruitBlueberry from "../../assets/images/fruit-blueberry.png";
import fruitKiwi from "../../assets/images/fruit-kiwi.png";
import fruitStrawberry from "../../assets/images/fruit-strawberry.png";
import { LogoMark } from "../../components/layout/LogoMark";
import { useAuth } from "../../contexts/AuthContext";
import { loginWithEmail } from "../../services/authService";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function AdminLoginPage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const redirectTo = locationState?.from?.pathname ?? "/admin/pedidos";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isLoadingAuth && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await loginWithEmail(email, password);
    } catch (loginError) {
      console.error("[admin] Falha ao autenticar:", loginError);
      setError("Não foi possível entrar. Confira e-mail e senha.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-app-shell min-h-dvh overflow-x-hidden text-[var(--admin-ink)] lg:h-dvh lg:overflow-hidden">
      <section className="grid min-h-dvh w-full bg-[var(--admin-surface)] lg:h-full lg:grid-cols-[1.04fr_0.96fr]">
        <div className="relative min-h-[21rem] overflow-hidden bg-[linear-gradient(145deg,var(--plum-950),var(--plum-800)_58%,var(--berry-600))] px-6 py-7 text-[var(--cream-50)] sm:px-8 lg:h-dvh lg:min-h-0 lg:p-12 xl:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,oklch(64%_0.17_126_/_18%),transparent_17rem),radial-gradient(circle_at_80%_24%,oklch(78%_0.12_346_/_16%),transparent_19rem)]" />
          <img
            src={fruitStrawberry}
            alt=""
            aria-hidden="true"
            className="absolute bottom-[28%] left-[55%] w-16 rotate-[-14deg] opacity-90 drop-shadow-[0_16px_22px_oklch(12%_0.04_326_/_24%)] sm:w-20 lg:w-20 xl:bottom-[24%] xl:w-28 2xl:w-32"
          />
          <img
            src={fruitKiwi}
            alt=""
            aria-hidden="true"
            className="absolute right-[9%] top-[23%] w-20 rotate-12 opacity-90 drop-shadow-[0_16px_22px_oklch(12%_0.04_326_/_24%)] sm:w-24 lg:w-24 xl:w-32 2xl:w-36"
          />
          <img
            src={fruitBlueberry}
            alt=""
            aria-hidden="true"
            className="absolute bottom-[29%] right-[17%] w-11 opacity-85 drop-shadow-[0_16px_22px_oklch(12%_0.04_326_/_24%)] sm:w-14 lg:w-14 xl:bottom-[24%] xl:w-20 2xl:w-24"
          />
          <img
            src={fruitBanana}
            alt=""
            aria-hidden="true"
            className="absolute bottom-[18%] left-[18%] w-14 rotate-12 opacity-80 drop-shadow-[0_16px_22px_oklch(12%_0.04_326_/_24%)] sm:w-16 lg:w-16 xl:bottom-[13%] xl:w-24 2xl:w-28"
          />

          <div className="relative z-10 flex h-full flex-col">
            <LogoMark
              href="/"
              className="[&>span:last-child]:text-[var(--cream-50)]"
            />

            <div className="mt-7 max-w-sm lg:mt-10 xl:mt-12">
              <p className="inline-flex items-center gap-2 rounded-full bg-[oklch(98%_0.01_326_/_12%)] px-3 py-1.5 text-sm font-extrabold text-[oklch(96%_0.02_326)]">
                <ShieldCheck size={16} />
                Painel seguro
              </p>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-none sm:text-5xl">
                Gestão dos pedidos em um só lugar.
              </h1>
              <p className="mt-4 max-w-xs text-sm font-semibold leading-6 text-[oklch(92%_0.02_326)] sm:text-base sm:leading-7">
                Acompanhe a fila, atualize o preparo e mantenha cada pedido
                organizado.
              </p>
            </div>

            <div className="pointer-events-none relative mt-auto flex min-h-[12rem] items-end justify-center pb-12 pt-4 lg:min-h-[16rem] lg:pb-16 xl:min-h-[27rem] xl:pb-8 2xl:min-h-[32rem] 2xl:pb-10">
              <div className="absolute bottom-10 h-20 w-[18rem] rounded-full bg-[oklch(12%_0.04_326_/_34%)] blur-2xl lg:bottom-14 lg:w-[24rem] xl:bottom-8 xl:h-32 xl:w-[34rem]" />
              <img
                src={heroBowl}
                alt=""
                aria-hidden="true"
                className="relative w-[min(82%,24rem)] max-h-[18rem] object-contain drop-shadow-[0_30px_38px_oklch(10%_0.04_326_/_34%)] lg:w-[min(72%,26rem)] lg:max-h-[18rem] xl:w-[min(92%,40rem)] xl:max-h-[29rem] 2xl:w-[min(88%,46rem)] 2xl:max-h-[34rem]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-8 sm:px-10 lg:h-dvh lg:px-14 lg:py-0 xl:px-20">
          <form className="w-full max-w-md" onSubmit={handleSubmit}>
            <div className="mb-8">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--admin-plum-soft)] text-[var(--admin-plum)]">
                <LockKeyhole size={23} />
              </div>
              <p className="text-sm font-extrabold text-[var(--admin-muted)]">
                Shalom Açaí
              </p>
              <h2 className="mt-1 font-display text-4xl font-extrabold leading-tight text-[var(--admin-ink)]">
                Acesso administrativo
              </h2>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold">
                  E-mail
                </span>
                <span className="relative block">
                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
                  />
                  <input
                    type="email"
                    value={email}
                    autoComplete="email"
                    className="min-h-[3.25rem] w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-4 pl-12 text-base font-semibold outline-none transition placeholder:text-[var(--ink-500)] focus:border-[var(--admin-plum)] focus:bg-[var(--admin-surface)] focus:ring-4 focus:ring-[oklch(31%_0.11_326_/_14%)]"
                    placeholder="admin@loja.com"
                    required
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-extrabold">Senha</span>
                <span className="relative block">
                  <KeyRound
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]"
                  />
                  <input
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    className="min-h-[3.25rem] w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-4 pl-12 text-base font-semibold outline-none transition placeholder:text-[var(--ink-500)] focus:border-[var(--admin-plum)] focus:bg-[var(--admin-surface)] focus:ring-4 focus:ring-[oklch(31%_0.11_326_/_14%)]"
                    placeholder="Sua senha"
                    required
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </span>
              </label>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-[var(--admin-danger-border)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm font-extrabold leading-6 text-[var(--admin-danger)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="button-leaf mt-6 min-h-[3.25rem] w-full rounded-2xl px-5 text-base font-extrabold transition duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--leaf-500)] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
