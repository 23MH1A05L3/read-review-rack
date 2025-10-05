import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, User, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-accent transition-colors">
            <BookOpen className="h-8 w-8" />
            <span>BookReview</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/add-book">
                  <Button variant="default" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Book
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="default">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
