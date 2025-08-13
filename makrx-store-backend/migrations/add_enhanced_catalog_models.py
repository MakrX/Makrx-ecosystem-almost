"""
Database migration for enhanced catalog models
Adds support for hierarchical categories, brands, collections, tags, and variants
"""

from sqlalchemy import text
from app.core.db import engine


def upgrade():
    """Apply the migration"""
    
    # SQL statements for the migration
    sql_statements = [
        # Add new columns to categories table
        """
        ALTER TABLE categories 
        ADD COLUMN IF NOT EXISTS path VARCHAR(1000),
        ADD COLUMN IF NOT EXISTS banner_image VARCHAR(500),
        ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
        ADD COLUMN IF NOT EXISTS seo_description VARCHAR(500),
        ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
        """,
        
        # Create unique index on path
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ix_categories_path ON categories(path);
        """,
        
        # Create hierarchical indexes
        """
        CREATE INDEX IF NOT EXISTS ix_categories_parent_active ON categories(parent_id, is_active);
        CREATE INDEX IF NOT EXISTS ix_categories_level_sort ON categories(level, sort_order);
        """,
        
        # Populate path field for existing categories
        """
        UPDATE categories 
        SET path = slug 
        WHERE path IS NULL AND parent_id IS NULL;
        """,
        
        # Create brands table
        """
        CREATE TABLE IF NOT EXISTS brands (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            logo VARCHAR(500),
            banner_image VARCHAR(500),
            website VARCHAR(500),
            founded INTEGER,
            headquarters VARCHAR(255),
            specialties JSONB DEFAULT '[]',
            seo_title VARCHAR(255),
            seo_description VARCHAR(500),
            is_active BOOLEAN DEFAULT TRUE,
            is_featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        # Create brand indexes
        """
        CREATE INDEX IF NOT EXISTS ix_brands_name ON brands(name);
        CREATE INDEX IF NOT EXISTS ix_brands_slug ON brands(slug);
        """,
        
        # Add brand_id to products table
        """
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id);
        """,
        
        # Create collections table
        """
        CREATE TABLE IF NOT EXISTS collections (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            description TEXT NOT NULL,
            banner_image VARCHAR(500),
            curator_name VARCHAR(255),
            curator_bio TEXT,
            seo_title VARCHAR(255),
            seo_description VARCHAR(500),
            tags JSONB DEFAULT '[]',
            featured_categories JSONB DEFAULT '[]',
            is_active BOOLEAN DEFAULT TRUE,
            is_featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        # Create collection_products table
        """
        CREATE TABLE IF NOT EXISTS collection_products (
            id SERIAL PRIMARY KEY,
            collection_id INTEGER NOT NULL REFERENCES collections(id),
            product_id INTEGER NOT NULL REFERENCES products(id),
            sort_order INTEGER DEFAULT 0,
            is_featured BOOLEAN DEFAULT FALSE,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Create collection indexes
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ix_collection_products_unique 
        ON collection_products(collection_id, product_id);
        CREATE INDEX IF NOT EXISTS ix_collection_products_sort 
        ON collection_products(collection_id, sort_order);
        """,
        
        # Create tags table
        """
        CREATE TABLE IF NOT EXISTS tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            usage_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            is_featured BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        # Create tag indexes
        """
        CREATE INDEX IF NOT EXISTS ix_tags_name ON tags(name);
        CREATE INDEX IF NOT EXISTS ix_tags_usage_count ON tags(usage_count);
        """,
        
        # Create product_tags table
        """
        CREATE TABLE IF NOT EXISTS product_tags (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id),
            tag_id INTEGER NOT NULL REFERENCES tags(id),
            added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        
        # Create product_tags indexes
        """
        CREATE UNIQUE INDEX IF NOT EXISTS ix_product_tags_unique 
        ON product_tags(product_id, tag_id);
        """,
        
        # Create product_variants table
        """
        CREATE TABLE IF NOT EXISTS product_variants (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES products(id),
            sku VARCHAR(100) NOT NULL UNIQUE,
            attributes JSONB DEFAULT '{}',
            price NUMERIC(10, 2),
            sale_price NUMERIC(10, 2),
            stock_qty INTEGER DEFAULT 0,
            images JSONB DEFAULT '[]',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        """,
        
        # Create variant indexes
        """
        CREATE INDEX IF NOT EXISTS ix_product_variants_sku ON product_variants(sku);
        CREATE INDEX IF NOT EXISTS ix_product_variants_product_active 
        ON product_variants(product_id, is_active);
        """,
        
        # Create some default brands from existing product brands
        """
        INSERT INTO brands (name, slug, is_active)
        SELECT DISTINCT 
            brand, 
            LOWER(REPLACE(REPLACE(brand, ' ', '-'), '.', '')),
            TRUE
        FROM products 
        WHERE brand IS NOT NULL 
        AND brand != ''
        ON CONFLICT (slug) DO NOTHING;
        """,
        
        # Update products to reference brand_id
        """
        UPDATE products 
        SET brand_id = brands.id 
        FROM brands 
        WHERE products.brand = brands.name 
        AND products.brand_id IS NULL;
        """,
        
        # Create some default tags from product tags arrays
        """
        WITH tag_values AS (
            SELECT DISTINCT jsonb_array_elements_text(tags) as tag_name
            FROM products 
            WHERE jsonb_array_length(tags) > 0
        )
        INSERT INTO tags (name, slug, is_active)
        SELECT 
            tag_name,
            LOWER(REPLACE(REPLACE(tag_name, ' ', '-'), '.', '')),
            TRUE
        FROM tag_values
        WHERE tag_name IS NOT NULL
        ON CONFLICT (slug) DO NOTHING;
        """,
        
        # Populate product_tags table
        """
        INSERT INTO product_tags (product_id, tag_id)
        SELECT DISTINCT p.id, t.id
        FROM products p
        CROSS JOIN LATERAL jsonb_array_elements_text(p.tags) as tag_name
        JOIN tags t ON t.name = tag_name
        ON CONFLICT (product_id, tag_id) DO NOTHING;
        """,
        
        # Update tag usage counts
        """
        UPDATE tags 
        SET usage_count = (
            SELECT COUNT(*) 
            FROM product_tags 
            WHERE tag_id = tags.id
        );
        """,
    ]
    
    # Execute all statements
    with engine.connect() as conn:
        for sql in sql_statements:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"✓ Executed: {sql[:50]}...")
            except Exception as e:
                print(f"✗ Failed: {sql[:50]}... - {e}")
                conn.rollback()


def downgrade():
    """Reverse the migration"""
    
    sql_statements = [
        "DROP TABLE IF EXISTS product_variants CASCADE;",
        "DROP TABLE IF EXISTS product_tags CASCADE;",
        "DROP TABLE IF EXISTS tags CASCADE;",
        "DROP TABLE IF EXISTS collection_products CASCADE;",
        "DROP TABLE IF EXISTS collections CASCADE;",
        "ALTER TABLE products DROP COLUMN IF EXISTS brand_id;",
        "DROP TABLE IF EXISTS brands CASCADE;",
        "ALTER TABLE categories DROP COLUMN IF EXISTS path, DROP COLUMN IF EXISTS banner_image, DROP COLUMN IF EXISTS seo_title, DROP COLUMN IF EXISTS seo_description, DROP COLUMN IF EXISTS level, DROP COLUMN IF EXISTS is_featured;",
    ]
    
    with engine.connect() as conn:
        for sql in sql_statements:
            try:
                conn.execute(text(sql))
                conn.commit()
                print(f"✓ Reverted: {sql[:50]}...")
            except Exception as e:
                print(f"✗ Failed to revert: {sql[:50]}... - {e}")
                conn.rollback()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
