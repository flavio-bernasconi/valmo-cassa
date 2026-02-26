import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center bg-slate-50">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <TooltipProvider>
          <div className="w-full gap-20 p-8 ">{children}</div>
        </TooltipProvider>
        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <ThemeSwitcher />
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
          <a href="/protected/dashboard">Dashboard</a>
        </footer>
      </div>
    </main>
  );
}
