import { useState, useEffect } from 'react';
import { 
  Star, ThumbsUp, ThumbsDown, Send, User, Calendar,
  CheckCircle, AlertTriangle, MessageSquare, Filter,
  TrendingUp, Award, BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface EquipmentRating {
  id: string;
  user_id: string;
  user_name: string;
  overall_rating: number;
  reliability_rating?: number;
  ease_of_use_rating?: number;
  condition_rating?: number;
  feedback_text?: string;
  pros?: string;
  cons?: string;
  suggestions?: string;
  issues_encountered?: string;
  would_recommend?: boolean;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  is_approved: boolean;
  is_featured: boolean;
  admin_response?: string;
}

interface RatingFormData {
  overall_rating: number;
  reliability_rating: number;
  ease_of_use_rating: number;
  condition_rating: number;
  feedback_text: string;
  pros: string;
  cons: string;
  suggestions: string;
  issues_encountered: string;
  would_recommend: boolean | null;
  difficulty_level: string;
}

interface EquipmentRatingProps {
  equipmentId: string;
  equipmentName: string;
  averageRating?: number;
  totalRatings?: number;
  canRate: boolean;
  onRatingSubmit?: (ratingData: any) => void;
}

export default function EquipmentRating({
  equipmentId,
  equipmentName,
  averageRating,
  totalRatings,
  canRate,
  onRatingSubmit
}: EquipmentRatingProps) {
  const { user } = useAuth();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratings, setRatings] = useState<EquipmentRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterBy, setFilterBy] = useState<'all' | 'featured' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [hasUserRated, setHasUserRated] = useState(false);

  const [formData, setFormData] = useState<RatingFormData>({
    overall_rating: 0,
    reliability_rating: 0,
    ease_of_use_rating: 0,
    condition_rating: 0,
    feedback_text: '',
    pros: '',
    cons: '',
    suggestions: '',
    issues_encountered: '',
    would_recommend: null,
    difficulty_level: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRatings();
    checkUserRating();
  }, [equipmentId, user]);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/equipment/${equipmentId}/ratings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const ratingsData = await response.json();
        setRatings(ratingsData);
      } else {
        // Fallback to mock data
        setRatings(mockRatings);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setRatings(mockRatings);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRating = async () => {
    if (!user) return;
    
    // Check if current user has already rated this equipment
    const userRating = ratings.find(rating => rating.user_id === user.id);
    setHasUserRated(!!userRating);
  };

  const mockRatings: EquipmentRating[] = [
    {
      id: 'rating-1',
      user_id: 'user-1',
      user_name: 'Sarah Johnson',
      overall_rating: 5,
      reliability_rating: 5,
      ease_of_use_rating: 4,
      condition_rating: 5,
      feedback_text: 'Excellent 3D printer! Very reliable and produces high-quality prints. The interface is intuitive and the print bed adhesion is great.',
      pros: 'Great print quality, reliable, easy to use interface',
      cons: 'Could use better ventilation, filament loading could be easier',
      suggestions: 'Add an enclosure for better temperature control',
      would_recommend: true,
      difficulty_level: 'intermediate',
      created_at: '2024-01-20T10:30:00Z',
      is_approved: true,
      is_featured: true
    },
    {
      id: 'rating-2',
      user_id: 'user-2',
      user_name: 'Mike Chen',
      overall_rating: 4,
      reliability_rating: 4,
      ease_of_use_rating: 5,
      condition_rating: 3,
      feedback_text: 'Good printer overall. Had some issues with bed leveling but once set up properly, it works well.',
      pros: 'User-friendly software, good support community',
      cons: 'Bed leveling can be tricky, nozzle gets clogged sometimes',
      issues_encountered: 'Had to clean the nozzle twice during my project',
      would_recommend: true,
      difficulty_level: 'beginner',
      created_at: '2024-01-18T14:20:00Z',
      is_approved: true,
      is_featured: false
    }
  ];

  const filteredAndSortedRatings = () => {
    let filtered = [...ratings];

    // Apply filters
    switch (filterBy) {
      case 'featured':
        filtered = filtered.filter(rating => rating.is_featured);
        break;
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter(rating => new Date(rating.created_at) >= oneWeekAgo);
        break;
      default:
        // Show all approved ratings
        filtered = filtered.filter(rating => rating.is_approved);
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.overall_rating - a.overall_rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.overall_rating - b.overall_rating);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return filtered;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.overall_rating === 0) {
      newErrors.overall_rating = 'Overall rating is required';
    }

    if (!formData.feedback_text.trim()) {
      newErrors.feedback_text = 'Feedback is required';
    }

    if (formData.would_recommend === null) {
      newErrors.would_recommend = 'Please indicate if you would recommend this equipment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/v1/equipment/${equipmentId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          equipment_id: equipmentId
        })
      });

      if (response.ok) {
        const newRating = await response.json();
        setRatings(prev => [newRating, ...prev]);
        setHasUserRated(true);
        setShowRatingForm(false);
        
        // Reset form
        setFormData({
          overall_rating: 0,
          reliability_rating: 0,
          ease_of_use_rating: 0,
          condition_rating: 0,
          feedback_text: '',
          pros: '',
          cons: '',
          suggestions: '',
          issues_encountered: '',
          would_recommend: null,
          difficulty_level: ''
        });

        onRatingSubmit?.(newRating);
      } else {
        throw new Error('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const renderStars = (rating?: number, size: 'sm' | 'lg' = 'sm', interactive = false, onClick?: (rating: number) => void) => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    const safeRating = rating || 0;

    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? () => onClick?.(i + 1) : undefined}
        className={`${starSize} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
          i < Math.floor(safeRating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
        disabled={!interactive}
      >
        <Star className="w-full h-full" />
      </button>
    ));
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateRatingBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      if (rating.is_approved) {
        breakdown[rating.overall_rating as keyof typeof breakdown]++;
      }
    });
    return breakdown;
  };

  const ratingBreakdown = calculateRatingBreakdown();

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{(averageRating || 0).toFixed(1)}</div>
            <div className="flex items-center justify-center mb-2">
              {renderStars(averageRating || 0, 'lg')}
            </div>
            <p className="text-sm text-gray-600">{totalRatings || 0} rating{(totalRatings || 0) !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center space-x-2">
                <span className="text-sm w-8">{stars}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${totalRatings > 0 ? (ratingBreakdown[stars as keyof typeof ratingBreakdown] / totalRatings) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {ratingBreakdown[stars as keyof typeof ratingBreakdown]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Reviews</option>
            <option value="featured">Featured</option>
            <option value="recent">Recent</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {canRate && !hasUserRated && (
          <button
            onClick={() => setShowRatingForm(true)}
            className="inline-flex items-center px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90"
          >
            <Star className="w-4 h-4 mr-2" />
            Write Review
          </button>
        )}
      </div>

      {/* Rating Form */}
      {showRatingForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate {equipmentName}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1">
                {renderStars(formData.overall_rating, 'lg', true, (rating) => 
                  setFormData(prev => ({ ...prev, overall_rating: rating }))
                )}
              </div>
              {errors.overall_rating && (
                <p className="text-sm text-red-600 mt-1">{errors.overall_rating}</p>
              )}
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reliability</label>
                <div className="flex items-center space-x-1">
                  {renderStars(formData.reliability_rating, 'sm', true, (rating) => 
                    setFormData(prev => ({ ...prev, reliability_rating: rating }))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ease of Use</label>
                <div className="flex items-center space-x-1">
                  {renderStars(formData.ease_of_use_rating, 'sm', true, (rating) => 
                    setFormData(prev => ({ ...prev, ease_of_use_rating: rating }))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <div className="flex items-center space-x-1">
                  {renderStars(formData.condition_rating, 'sm', true, (rating) => 
                    setFormData(prev => ({ ...prev, condition_rating: rating }))
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.feedback_text}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback_text: e.target.value }))}
                placeholder="Share your experience with this equipment..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
              />
              {errors.feedback_text && (
                <p className="text-sm text-red-600 mt-1">{errors.feedback_text}</p>
              )}
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pros</label>
                <textarea
                  value={formData.pros}
                  onChange={(e) => setFormData(prev => ({ ...prev, pros: e.target.value }))}
                  placeholder="What did you like about this equipment?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cons</label>
                <textarea
                  value={formData.cons}
                  onChange={(e) => setFormData(prev => ({ ...prev, cons: e.target.value }))}
                  placeholder="What could be improved?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                />
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Would you recommend this equipment? <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recommend"
                      checked={formData.would_recommend === true}
                      onChange={() => setFormData(prev => ({ ...prev, would_recommend: true }))}
                      className="mr-2"
                    />
                    <ThumbsUp className="w-4 h-4 mr-1 text-green-600" />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recommend"
                      checked={formData.would_recommend === false}
                      onChange={() => setFormData(prev => ({ ...prev, would_recommend: false }))}
                      className="mr-2"
                    />
                    <ThumbsDown className="w-4 h-4 mr-1 text-red-600" />
                    No
                  </label>
                </div>
                {errors.would_recommend && (
                  <p className="text-sm text-red-600 mt-1">{errors.would_recommend}</p>
                )}
              </div>
            </div>

            {/* Issues Encountered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issues Encountered</label>
              <textarea
                value={formData.issues_encountered}
                onChange={(e) => setFormData(prev => ({ ...prev, issues_encountered: e.target.value }))}
                placeholder="Describe any problems or issues you encountered..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-makrx-blue focus:border-transparent"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRatingForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-makrx-blue text-white rounded-lg hover:bg-makrx-blue/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-makrx-blue mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading reviews...</p>
          </div>
        ) : filteredAndSortedRatings().length > 0 ? (
          filteredAndSortedRatings().map((rating) => (
            <div key={rating.id} className="bg-white p-6 rounded-lg border border-gray-200">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{rating.user_name}</h4>
                      {rating.is_featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(rating.overall_rating)}
                      <span className="text-sm text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                      {rating.difficulty_level && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(rating.difficulty_level)}`}>
                          {rating.difficulty_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {rating.would_recommend !== undefined && (
                  <div className="flex items-center">
                    {rating.would_recommend ? (
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="space-y-3">
                {rating.feedback_text && (
                  <p className="text-gray-800">{rating.feedback_text}</p>
                )}

                {/* Detailed Ratings */}
                {(rating.reliability_rating || rating.ease_of_use_rating || rating.condition_rating) && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {rating.reliability_rating && (
                      <div>
                        <span className="text-gray-600">Reliability: </span>
                        <div className="flex items-center">
                          {renderStars(rating.reliability_rating)}
                        </div>
                      </div>
                    )}
                    {rating.ease_of_use_rating && (
                      <div>
                        <span className="text-gray-600">Ease of Use: </span>
                        <div className="flex items-center">
                          {renderStars(rating.ease_of_use_rating)}
                        </div>
                      </div>
                    )}
                    {rating.condition_rating && (
                      <div>
                        <span className="text-gray-600">Condition: </span>
                        <div className="flex items-center">
                          {renderStars(rating.condition_rating)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pros and Cons */}
                {(rating.pros || rating.cons) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {rating.pros && (
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">👍 Pros:</h5>
                        <p className="text-gray-700">{rating.pros}</p>
                      </div>
                    )}
                    {rating.cons && (
                      <div>
                        <h5 className="font-medium text-red-700 mb-1">👎 Cons:</h5>
                        <p className="text-gray-700">{rating.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Issues and Suggestions */}
                {(rating.issues_encountered || rating.suggestions) && (
                  <div className="space-y-2 text-sm">
                    {rating.issues_encountered && (
                      <div>
                        <h5 className="font-medium text-orange-700 mb-1">⚠️ Issues Encountered:</h5>
                        <p className="text-gray-700">{rating.issues_encountered}</p>
                      </div>
                    )}
                    {rating.suggestions && (
                      <div>
                        <h5 className="font-medium text-blue-700 mb-1">💡 Suggestions:</h5>
                        <p className="text-gray-700">{rating.suggestions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Response */}
                {rating.admin_response && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <h5 className="font-medium text-blue-900 mb-1">Response from Management:</h5>
                    <p className="text-blue-800 text-sm">{rating.admin_response}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              {canRate && !hasUserRated 
                ? 'Be the first to review this equipment!'
                : 'Reviews will appear here once submitted.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
