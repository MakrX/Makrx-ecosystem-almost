'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, User, ChevronDown, Filter, Search, Edit, Trash2, Flag } from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  images?: string[];
  response?: {
    content: string;
    date: string;
    author: string;
  };
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  userId?: string;
  isAuthenticated: boolean;
}

const mockReviews: Review[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah M.',
    userAvatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U',
    rating: 5,
    title: 'Excellent quality and fast shipping!',
    content: 'This 3D printed phone case exceeded my expectations. The material feels premium and the custom design came out perfectly. Highly recommend for anyone looking for personalized accessories.',
    date: '2024-01-15',
    verified: true,
    helpful: 12,
    notHelpful: 1,
    images: ['https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=Photo', 'https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=Photo']
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    userAvatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U',
    rating: 4,
    title: 'Good product, minor issues with color',
    content: 'Overall very satisfied with the purchase. The print quality is excellent and it fits my phone perfectly. The only issue is that the color was slightly different from what I expected, but still looks great.',
    date: '2024-01-12',
    verified: true,
    helpful: 8,
    notHelpful: 2,
    response: {
      content: 'Thank you for your feedback! We\'re working on improving our color accuracy. Please contact support if you\'d like a replacement.',
      date: '2024-01-13',
      author: 'MakrX Team'
    }
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Emily R.',
    userAvatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U',
    rating: 5,
    title: 'Perfect custom design service',
    content: 'Amazing experience from design to delivery. The team helped me refine my design and the final product is exactly what I wanted. Will definitely order again!',
    date: '2024-01-10',
    verified: true,
    helpful: 15,
    notHelpful: 0
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'David L.',
    userAvatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U',
    rating: 3,
    title: 'Average quality for the price',
    content: 'The case works fine and protects my phone well. However, I expected better surface finish for the price point. It\'s functional but not premium feeling.',
    date: '2024-01-08',
    verified: true,
    helpful: 5,
    notHelpful: 8
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Lisa K.',
    userAvatar: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U',
    rating: 5,
    title: 'Love the customization options!',
    content: 'So many options to personalize! The upload process was easy and the preview feature helped me visualize the final product. Shipping was super fast too.',
    date: '2024-01-05',
    verified: true,
    helpful: 9,
    notHelpful: 1
  }
];

const mockSummary: ReviewSummary = {
  averageRating: 4.4,
  totalReviews: 47,
  ratingDistribution: {
    5: 28,
    4: 12,
    3: 4,
    2: 2,
    1: 1
  }
};

export default function ProductReviews({ productId, userId, isAuthenticated }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [summary, setSummary] = useState<ReviewSummary>(mockSummary);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>(mockReviews);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    content: ''
  });

  useEffect(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, filterRating, sortBy, searchTerm]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || newReview.rating === 0) return;

    const review: Review = {
      id: Date.now().toString(),
      userId: userId || 'current-user',
      userName: 'You',
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      helpful: 0,
      notHelpful: 0
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 0, title: '', content: '' });
    setShowWriteReview(false);
  };

  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpful: isHelpful ? review.helpful + 1 : review.helpful,
          notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful
        };
      }
      return review;
    }));
  };

  const StarRating = ({ rating, size = 'sm', interactive = false, onRatingChange }: {
    rating: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
  }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
            className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-full h-full ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const RatingDistribution = ({ distribution, total }: { distribution: ReviewSummary['ratingDistribution'], total: number }) => (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution];
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={rating} className="flex items-center gap-2 text-sm">
            <span className="w-8">{rating}</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-gray-500">{count}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-4xl font-bold">{summary.averageRating}</span>
            <div>
              <StarRating rating={summary.averageRating} size="md" />
              <p className="text-sm text-gray-500">{summary.totalReviews} reviews</p>
            </div>
          </div>
        </div>
        
        <div>
          <RatingDistribution distribution={summary.ratingDistribution} total={summary.totalReviews} />
        </div>
      </div>

      {/* Write Review Button */}
      {isAuthenticated && (
        <div className="text-center">
          <button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Edit className="w-4 h-4" />
            Write a Review
          </button>
        </div>
      )}

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating *</label>
              <StarRating
                rating={newReview.rating}
                size="lg"
                interactive
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Review Title *</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Summarize your experience"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Review *</label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={newReview.rating === 0}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowWriteReview(false)}
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterRating || ''}
            onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews match your criteria.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.userName}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-gray-600">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
              
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4">{review.content}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review.id, true)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id, false)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Not helpful ({review.notHelpful})</span>
                  </button>
                </div>
              </div>
              
              {review.response && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-blue-900 dark:text-blue-300">
                      {review.response.author}
                    </span>
                    <span className="text-sm text-blue-700 dark:text-blue-400">
                      {new Date(review.response.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-blue-800 dark:text-blue-300">{review.response.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!isAuthenticated && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 mb-4">Sign in to write a review</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      )}
    </div>
  );
}
