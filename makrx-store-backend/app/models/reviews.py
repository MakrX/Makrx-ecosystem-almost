"""
SQLAlchemy models for reviews and ratings system
Product reviews, service reviews, ratings, and moderation
"""

from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.db import Base

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(String(255), nullable=False, index=True)  # From JWT sub claim
    email = Column(String(255), nullable=False, index=True)
    username = Column(String(255))  # Display name
    
    # Review target
    target_type = Column(String(50), nullable=False, index=True)  # product, service, provider
    target_id = Column(String(255), nullable=False, index=True)
    
    # Order/purchase verification
    order_id = Column(Integer, nullable=True, index=True)
    verified_purchase = Column(Boolean, default=False)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255))
    content = Column(Text, nullable=False)
    
    # Detailed ratings (for products)
    detailed_ratings = Column(JSONB, default={})  # quality, value, shipping, etc.
    
    # Media attachments
    images = Column(JSONB, default=[])  # Array of image URLs
    videos = Column(JSONB, default=[])  # Array of video URLs
    
    # Review metadata
    pros = Column(JSONB, default=[])  # Array of pros
    cons = Column(JSONB, default=[])  # Array of cons
    recommended = Column(Boolean, nullable=True)  # Would recommend?
    
    # Moderation and status
    status = Column(String(50), default="pending", index=True)
    # pending, published, hidden, rejected, flagged
    
    moderation_notes = Column(Text)
    moderated_by = Column(String(255))
    moderated_at = Column(DateTime(timezone=True))
    
    # Helpfulness tracking
    helpful_votes = Column(Integer, default=0)
    total_votes = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))
    
    # Relationships
    votes = relationship("ReviewVote", back_populates="review", cascade="all, delete-orphan")
    responses = relationship("ReviewResponse", back_populates="review", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("ix_reviews_target", "target_type", "target_id"),
        Index("ix_reviews_user_target", "user_id", "target_type", "target_id", unique=True),
        Index("ix_reviews_rating_status", "rating", "status"),
        Index("ix_reviews_verified_published", "verified_purchase", "published_at"),
    )

class ReviewVote(Base):
    __tablename__ = "review_votes"
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False)
    user_id = Column(String(255), nullable=False, index=True)
    
    # Vote details
    vote_type = Column(String(20), nullable=False)  # helpful, not_helpful
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    review = relationship("Review", back_populates="votes")
    
    # Indexes
    __table_args__ = (
        Index("ix_review_votes_user_review", "user_id", "review_id", unique=True),
    )

class ReviewResponse(Base):
    __tablename__ = "review_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False)
    
    # Response author
    responder_type = Column(String(50), nullable=False)  # admin, vendor, service_provider
    responder_id = Column(String(255), nullable=False)
    responder_name = Column(String(255), nullable=False)
    
    # Response content
    content = Column(Text, nullable=False)
    
    # Status
    is_public = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    review = relationship("Review", back_populates="responses")

class ProductRatingSummary(Base):
    __tablename__ = "product_rating_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, unique=True, index=True)
    
    # Overall ratings
    average_rating = Column(Numeric(3, 2), default=0.0)
    total_reviews = Column(Integer, default=0)
    verified_reviews = Column(Integer, default=0)
    
    # Rating distribution
    rating_distribution = Column(JSONB, default={})  # {1: count, 2: count, ...}
    
    # Detailed ratings averages
    detailed_averages = Column(JSONB, default={})  # quality, value, shipping averages
    
    # Recommendation stats
    recommendation_percentage = Column(Numeric(5, 2), default=0.0)
    
    # Last update
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index("ix_product_rating_summaries_rating", "average_rating"),
    )

class ServiceProviderRating(Base):
    __tablename__ = "service_provider_ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(String(255), nullable=False, unique=True, index=True)
    
    # Overall ratings
    average_rating = Column(Numeric(3, 2), default=0.0)
    total_reviews = Column(Integer, default=0)
    
    # Service-specific ratings
    quality_rating = Column(Numeric(3, 2), default=0.0)
    speed_rating = Column(Numeric(3, 2), default=0.0)
    communication_rating = Column(Numeric(3, 2), default=0.0)
    value_rating = Column(Numeric(3, 2), default=0.0)
    
    # Performance metrics
    completed_jobs = Column(Integer, default=0)
    on_time_delivery_rate = Column(Numeric(5, 2), default=0.0)
    customer_satisfaction_rate = Column(Numeric(5, 2), default=0.0)
    
    # Last update
    last_calculated = Column(DateTime(timezone=True), server_default=func.now())

class ReviewFlag(Base):
    __tablename__ = "review_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False)
    flagger_id = Column(String(255), nullable=False, index=True)
    
    # Flag details
    flag_type = Column(String(50), nullable=False)  # spam, fake, inappropriate, offensive
    reason = Column(Text)
    
    # Status
    status = Column(String(50), default="pending")  # pending, reviewed, resolved, dismissed
    
    # Moderation
    reviewed_by = Column(String(255))
    reviewed_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index("ix_review_flags_review_status", "review_id", "status"),
    )

class ReviewTemplate(Base):
    __tablename__ = "review_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # product_category, service_type
    
    # Template content
    questions = Column(JSONB, default=[])  # Structured review questions
    rating_criteria = Column(JSONB, default=[])  # What to rate (quality, value, etc.)
    
    # Usage
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ReviewIncentive(Base):
    __tablename__ = "review_incentives"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Incentive details
    incentive_type = Column(String(50), nullable=False)  # credits, discount, points
    incentive_value = Column(Numeric(10, 2), nullable=False)
    
    # Conditions
    minimum_rating = Column(Integer, default=1)
    minimum_content_length = Column(Integer, default=50)
    requires_image = Column(Boolean, default=False)
    requires_verified_purchase = Column(Boolean, default=True)
    
    # Limits
    max_uses_per_user = Column(Integer, default=1)
    max_total_uses = Column(Integer, nullable=True)
    current_uses = Column(Integer, default=0)
    
    # Validity
    valid_from = Column(DateTime(timezone=True))
    valid_until = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ReviewIncentiveRedemption(Base):
    __tablename__ = "review_incentive_redemptions"
    
    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(UUID(as_uuid=True), ForeignKey("reviews.id"), nullable=False)
    incentive_id = Column(Integer, ForeignKey("review_incentives.id"), nullable=False)
    user_id = Column(String(255), nullable=False, index=True)
    
    # Redemption details
    redeemed_value = Column(Numeric(10, 2), nullable=False)
    redemption_method = Column(String(50))  # credit_wallet, discount_code, etc.
    reference_id = Column(String(255))  # Credit transaction ID, etc.
    
    # Status
    status = Column(String(50), default="pending")  # pending, processed, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
    
    # Indexes
    __table_args__ = (
        Index("ix_review_incentive_redemptions_user", "user_id", "incentive_id"),
    )
