import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ReviewCard from '@/components/ReviewCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);
  const [editingReview, setEditingReview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'book' | 'review'>('review');

  useEffect(() => {
    if (id) {
      fetchBookDetails();
      fetchReviews();
    }
  }, [id, user]);

  const fetchBookDetails = async () => {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();

    if (error) {
      toast.error('Failed to fetch book details');
      return;
    }

    setBook(data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(name)')
      .eq('book_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch reviews');
      return;
    }

    setReviews(data || []);

    if (user) {
      const existingReview = data?.find((r) => r.user_id === user.id);
      if (existingReview) {
        setUserReview(existingReview);
        setRating(existingReview.rating);
        setReviewText(existingReview.review_text);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({ rating, review_text: reviewText })
          .eq('id', userReview.id);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        // Create new review
        const { error } = await supabase.from('reviews').insert({
          book_id: id,
          user_id: user.id,
          rating,
          review_text: reviewText,
        });

        if (error) throw error;
        toast.success('Review submitted successfully');
      }

      setEditingReview(false);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    const { error } = await supabase.from('reviews').delete().eq('id', userReview.id);

    if (error) {
      toast.error('Failed to delete review');
      return;
    }

    toast.success('Review deleted successfully');
    setUserReview(null);
    setRating(0);
    setReviewText('');
    setDeleteDialogOpen(false);
    fetchReviews();
  };

  const handleDeleteBook = async () => {
    const { error } = await supabase.from('books').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete book');
      return;
    }

    toast.success('Book deleted successfully');
    navigate('/');
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

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Book not found</h1>
        </div>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const isBookOwner = user?.id === book.added_by;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary" className="text-lg">
                {book.genre}
              </Badge>
              <span className="text-lg text-muted-foreground">{book.published_year}</span>
            </div>
            <CardTitle className="text-4xl mb-2">{book.title}</CardTitle>
            <CardDescription className="text-xl">{book.author}</CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.round(averageRating) ? 'fill-accent text-accent' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-lg mb-4">{book.description}</p>
            {isBookOwner && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate(`/edit-book/${book.id}`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Book
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteType('book');
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Book
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{userReview && !editingReview ? 'Your Review' : 'Write a Review'}</CardTitle>
            </CardHeader>
            <CardContent>
              {userReview && !editingReview ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < userReview.rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-foreground mb-4">{userReview.review_text}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditingReview(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Review
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setDeleteType('review');
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Review
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 cursor-pointer transition-colors ${
                              star <= rating ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Your Review</label>
                    <Textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts about this book..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                    </Button>
                    {userReview && editingReview && (
                      <Button type="button" variant="outline" onClick={() => setEditingReview(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-6">All Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No reviews yet. Be the first to review this book!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  userName={review.profiles?.name || 'Anonymous'}
                  rating={review.rating}
                  reviewText={review.review_text}
                  createdAt={review.created_at}
                  isOwner={user?.id === review.user_id}
                  onEdit={() => {
                    setEditingReview(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onDelete={() => {
                    setDeleteType('review');
                    setDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your {deleteType}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteType === 'book' ? handleDeleteBook : handleDeleteReview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookDetails;
