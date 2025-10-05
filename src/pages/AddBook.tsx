import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AddBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    published_year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();

    if (error) {
      toast.error('Failed to fetch book details');
      navigate('/');
      return;
    }

    if (data.added_by !== user?.id) {
      toast.error('You can only edit your own books');
      navigate('/');
      return;
    }

    setFormData({
      title: data.title,
      author: data.author,
      description: data.description || '',
      genre: data.genre,
      published_year: data.published_year,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to add a book');
      return;
    }

    setLoading(true);

    try {
      if (id) {
        // Update existing book
        const { error } = await supabase.from('books').update(formData).eq('id', id);

        if (error) throw error;
        toast.success('Book updated successfully');
        navigate(`/book/${id}`);
      } else {
        // Create new book
        const { data, error } = await supabase
          .from('books')
          .insert({ ...formData, added_by: user.id })
          .select()
          .single();

        if (error) throw error;
        toast.success('Book added successfully');
        navigate(`/book/${data.id}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">{id ? 'Edit Book' : 'Add New Book'}</CardTitle>
            <CardDescription>{id ? 'Update book information' : 'Share a new book with the community'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  placeholder="e.g., Fiction, Mystery, Science Fiction"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Published Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={formData.published_year}
                  onChange={(e) => setFormData({ ...formData, published_year: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter book description..."
                  rows={5}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : id ? 'Update Book' : 'Add Book'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBook;
