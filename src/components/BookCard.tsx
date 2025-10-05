import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  averageRating?: number;
  reviewCount?: number;
}

const BookCard = ({ id, title, author, genre, publishedYear, averageRating, reviewCount }: BookCardProps) => {
  return (
    <Link to={`/book/${id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary">{genre}</Badge>
            <span className="text-sm text-muted-foreground">{publishedYear}</span>
          </div>
          <CardTitle className="text-xl line-clamp-2">{title}</CardTitle>
          <CardDescription className="text-base">{author}</CardDescription>
        </CardHeader>
        <CardFooter className="flex items-center gap-2">
          {averageRating !== undefined && (
            <div className="flex items-center gap-1 text-accent">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BookCard;
