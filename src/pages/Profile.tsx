import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import BookCard from '@/components/BookCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User, BookOpen, MessageSquare } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userBooks, setUserBooks] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setProfile(profileData);

      // Fetch user's books
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .eq('added_by', user?.id)
        .order('created_at', { ascending: false });

      // Fetch average ratings for user's books
      const booksWithRatings = await Promise.all(
        (booksData || []).map(async (book) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('book_id', book.id);

          const averageRating =
            reviews && reviews.length > 0
              ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
              : 0;

          return {
            ...book,
            averageRating,
            reviewCount: reviews?.length || 0,
          };
        })
      );

      setUserBooks(booksWithRatings);

      // Fetch user's reviews with book details
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, books(title, author)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setUserReviews(reviewsData || []);
    } catch (error: any) {
      toast.error('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                <User className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl">{profile?.name}</CardTitle>
                <CardDescription className="text-lg">{profile?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{userBooks.length}</p>
                <p className="text-muted-foreground">Books Added</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <p className="text-2xl font-bold">{userReviews.length}</p>
                <p className="text-muted-foreground">Reviews Written</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <User className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">Member</p>
                <p className="text-muted-foreground">Since {new Date(profile?.created_at).getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="books">My Books</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="books" className="mt-6">
            {userBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">You haven't added any books yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    title={book.title}
                    author={book.author}
                    genre={book.genre}
                    publishedYear={book.published_year}
                    averageRating={book.averageRating}
                    reviewCount={book.reviewCount}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            {userReviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">You haven't written any reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <CardTitle className="text-xl">{review.books?.title}</CardTitle>
                      <CardDescription>by {review.books?.author}</CardDescription>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xl ${
                              i < review.rating ? 'text-accent' : 'text-muted-foreground'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground">{review.review_text}</p>
                      <p className="text-sm text-muted-foreground mt-4">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
