import { ReactNode } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import GlassPanel from "@/components/GlassPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

interface NavItem {
  label: string;
  to: string;
  icon?: ReactNode;
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  badge?: string;
  heroIllustration?: ReactNode;
  navItems?: NavItem[];
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  onPlayClick?: () => void;
  onReviewClick?: () => void;
  hideHeroButtons?: boolean;
}

const AppShell = ({
  title,
  subtitle,
  badge,
  heroIllustration,
  navItems = [],
  actions,
  children,
  className,
  onPlayClick,
  onReviewClick,
  hideHeroButtons = false,
}: AppShellProps) => {
  const navigate = useNavigate();

  const handleShare = async () => {
    const shareData = {
      title: "English Verb Bomb",
      text: "Practice English verbs with fun games!",
      url: "https://bitebite.app",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText("https://bitebite.app");
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Failed to share");
      }
    }
  };

  return (
    <div
      className={cn(
        "min-h-svh w-full bg-gradient-to-b from-[hsl(var(--hero-start))] to-[hsl(var(--hero-end))] pb-[env(safe-area-inset-bottom,0px)]",
        className,
      )}
    >
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 pb-[env(safe-area-inset-top,0px)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-3 py-4 sm:px-4">
          <div className="flex items-center gap-2 font-black text-lg text-primary md:text-xl">
            <img src={logo} alt="English Verb Bomb" className="h-8 w-8 object-contain" />
            English Verb Bomb
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="rounded-full px-4 py-2 text-sm font-bold text-muted-foreground transition hover:text-primary"
                  activeClassName="bg-primary/10 text-primary"
                >
                  <span className="flex items-center gap-2">
                    {link.icon}
                    {link.label}
                  </span>
                </NavLink>
              ))}
            </div>
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="rounded-full font-bold"
            >
              <Share2 className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Share</span>
            </Button>
            {actions && <div className="hidden md:flex">{actions}</div>}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 pb-28 pt-6 sm:px-4 sm:pb-16 sm:pt-8">
        <GlassPanel className="relative overflow-hidden">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              {badge && (
                <span className="inline-flex items-center rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-primary">
                  {badge}
                </span>
              )}
              <div>
                <h1 className="text-3xl font-black text-foreground sm:text-4xl md:text-5xl">{title}</h1>
                {subtitle && <p className="mt-2 text-base text-muted-foreground sm:text-lg">{subtitle}</p>}
              </div>
              {!hideHeroButtons && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full font-black uppercase tracking-wide"
                    onClick={() => (onPlayClick ? onPlayClick() : navigate("/modes"))}
                  >
                    Play & Learn
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full border-2 border-dashed border-primary/50 font-black text-primary"
                    onClick={() => (onReviewClick ? onReviewClick() : navigate("/review"))}
                  >
                    Review Lab
                  </Button>
                </div>
              )}
            </div>
            {heroIllustration && (
              <div className="relative flex w-full max-w-sm justify-center">
                <div className="absolute inset-0 -z-10 blur-3xl" aria-hidden />
                {heroIllustration}
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-playful-bubbles opacity-60 md:block" />
        </GlassPanel>

        <main className="space-y-6">{children}</main>
      </div>

      {navItems.length > 0 && (
        <nav className="fixed bottom-4 left-1/2 z-40 w-[min(430px,92%)] -translate-x-1/2 rounded-[999px] border border-border/80 bg-background/95 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_15px_35px_rgba(15,23,42,0.25)] backdrop-blur">
          <div className="flex items-center justify-around gap-2 text-sm font-bold text-muted-foreground md:hidden">
            {navItems.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="flex-1 rounded-full px-3 py-2 text-center transition"
                activeClassName="bg-primary/15 text-primary"
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default AppShell;

