import { Sparkles, LogOut, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full py-6 px-8 border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight">
              Atelier<span className="text-gradient-gold">AI</span>
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">
              Virtual Fashion Studio
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-6 mr-4 border-r border-border pr-6">
                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/generate" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                  Generate
                </Link>
                <Link to="/gallery" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Gallery
                </Link>
                <Link to="/favorites" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Favorites
                </Link>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-red-400">
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-gold text-white hover:opacity-90 transition-opacity">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
