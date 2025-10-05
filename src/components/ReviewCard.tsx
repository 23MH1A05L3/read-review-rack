import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Edit, Trash2 } from 'lucide-react';

interface ReviewCardProps {
  id: string;
  userName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ReviewCard = ({ userName, rating, reviewText, createdAt, isOwner, onEdit, onDelete }: ReviewCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{userName}</CardTitle>
            <CardDescription>{new Date(createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground mb-4">{reviewText}</p>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
