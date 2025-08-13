/**
 * Complete Flag Definitions for MakrX Ecosystem
 * All flags from the specification organized by namespace
 */

import { FlagDefinition } from '../core/FeatureFlagEngine';

// Org (MakrX.org) Flags
export const ORG_FLAGS: FlagDefinition[] = [
  {
    key: 'org.links.makrcave',
    namespace: 'org',
    area: 'links',
    feature: 'makrcave',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Show MakrCave link',
    owner: 'org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'org.links.store',
    namespace: 'org',
    area: 'links',
    feature: 'store',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Show Store link',
    owner: 'org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'org.profile.edit',
    namespace: 'org',
    area: 'profile',
    feature: 'edit',
    type: 'boolean',
    scope: 'role',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Profile edit page',
    owner: 'org',
    enabledForRoles: ['user', 'provider', 'makerspace_admin', 'store_admin', 'superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'org.docs.public',
    namespace: 'org',
    area: 'docs',
    feature: 'public',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Public docs section',
    owner: 'org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'org.status.enabled',
    namespace: 'org',
    area: 'status',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Status page',
    owner: 'org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'org.forum.enabled',
    namespace: 'org',
    area: 'forum',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Community forum link',
    owner: 'org',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'org.billing.unified',
    namespace: 'org',
    area: 'billing',
    feature: 'unified',
    type: 'boolean',
    scope: 'role',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Central billing overview',
    owner: 'org',
    enabledForRoles: ['makerspace_admin', 'store_admin', 'superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Cave (MakrCave) Flags
export const CAVE_FLAGS: FlagDefinition[] = [
  // 2A) Spaces & membership
  {
    key: 'cave.spaces.public_pages',
    namespace: 'cave',
    area: 'spaces',
    feature: 'public_pages',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Public space profile pages',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.memberships.invite_only',
    namespace: 'cave',
    area: 'memberships',
    feature: 'invite_only',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Only admins can add members',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.notifications.enabled',
    namespace: 'cave',
    area: 'notifications',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Email/SMS notifications',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2B) Equipment & reservations
  {
    key: 'cave.equipment.enabled',
    namespace: 'cave',
    area: 'equipment',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Equipment module visibility',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.reservations.enabled',
    namespace: 'cave',
    area: 'reservations',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Booking capability',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.reservations.paid_usage',
    namespace: 'cave',
    area: 'reservations',
    feature: 'paid_usage',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Paid reservations',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.reservations.approval_flow',
    namespace: 'cave',
    area: 'reservations',
    feature: 'approval_flow',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Manual approval required',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.maintenance.enabled',
    namespace: 'cave',
    area: 'maintenance',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Maintenance tickets',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2C) Inventory & filament
  {
    key: 'cave.inventory.enabled',
    namespace: 'cave',
    area: 'inventory',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Inventory module',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.inventory.lot_tracking',
    namespace: 'cave',
    area: 'inventory',
    feature: 'lot_tracking',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Lot/batch tracking',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.inventory.low_stock_alerts',
    namespace: 'cave',
    area: 'inventory',
    feature: 'low_stock_alerts',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Alerts & badges',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.filament.tracking',
    namespace: 'cave',
    area: 'filament',
    feature: 'tracking',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Per-roll grams tracking',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.inventory.auto_reorder',
    namespace: 'cave',
    area: 'inventory',
    feature: 'auto_reorder',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Reorder on Store suggestions',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2D) Projects & BOM
  {
    key: 'cave.projects.enabled',
    namespace: 'cave',
    area: 'projects',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Projects module',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.bom.enabled',
    namespace: 'cave',
    area: 'bom',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'BOM editor',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.bom.to_store',
    namespace: 'cave',
    area: 'bom',
    feature: 'to_store',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'BOM→Cart integration',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.projects.files',
    namespace: 'cave',
    area: 'projects',
    feature: 'files',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'File attachments',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2E) Skills & badges
  {
    key: 'cave.skills.enabled',
    namespace: 'cave',
    area: 'skills',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Skill/badge system',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.skills.quiz_required',
    namespace: 'cave',
    area: 'skills',
    feature: 'quiz_required',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Quizzes to earn badges',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.skills.enforce_on_reservation',
    namespace: 'cave',
    area: 'skills',
    feature: 'enforce_on_reservation',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Gate reservations by badges',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2F) Providers & jobs
  {
    key: 'cave.providers.enabled',
    namespace: 'cave',
    area: 'providers',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Provider profiles',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.jobs.enabled',
    namespace: 'cave',
    area: 'jobs',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Job board',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.jobs.first_to_accept',
    namespace: 'cave',
    area: 'jobs',
    feature: 'first_to_accept',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Routing mode (vs auto)',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.jobs.auto_routing',
    namespace: 'cave',
    area: 'jobs',
    feature: 'auto_routing',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Capability/geo routing',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.jobs.attach_gcode',
    namespace: 'cave',
    area: 'jobs',
    feature: 'attach_gcode',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Provider can upload G-code',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 2G) Analytics
  {
    key: 'cave.analytics.enabled',
    namespace: 'cave',
    area: 'analytics',
    feature: 'enabled',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Utilization & SLA dashboards',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.analytics.provider_earnings',
    namespace: 'cave',
    area: 'analytics',
    feature: 'provider_earnings',
    type: 'boolean',
    scope: 'space',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Provider payout views',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Ops kill switches
  {
    key: 'cave.jobs.publish_enabled',
    namespace: 'cave',
    area: 'jobs',
    feature: 'publish_enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Stop Store→Cave publishing',
    owner: 'cave',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Store (MakrX.Store) Flags
export const STORE_FLAGS: FlagDefinition[] = [
  // 3A) Catalog & discovery
  {
    key: 'store.catalog.enabled',
    namespace: 'store',
    area: 'catalog',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Catalog routes visible',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.catalog.compare_drawer',
    namespace: 'store',
    area: 'catalog',
    feature: 'compare_drawer',
    type: 'percentage',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    percentageRollout: 0,
    description: 'In-page compare',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.catalog.kits',
    namespace: 'store',
    area: 'catalog',
    feature: 'kits',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Curated kits page',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.search.typeahead_entities',
    namespace: 'store',
    area: 'search',
    feature: 'typeahead_entities',
    type: 'percentage',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    percentageRollout: 100,
    description: 'Entity-aware search',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.reviews.enabled',
    namespace: 'store',
    area: 'reviews',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Product reviews',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3B) Cart & checkout
  {
    key: 'store.cart.enabled',
    namespace: 'store',
    area: 'cart',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Cart routes',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.checkout.one_page',
    namespace: 'store',
    area: 'checkout',
    feature: 'one_page',
    type: 'percentage',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    percentageRollout: 100,
    description: 'One-page checkout vs stepped',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.checkout.cod',
    namespace: 'store',
    area: 'checkout',
    feature: 'cod',
    type: 'boolean',
    scope: 'audience',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Cash on delivery',
    owner: 'store',
    enabledForPincodes: [], // Add specific pincodes
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.coupons.enabled',
    namespace: 'store',
    area: 'coupons',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Coupons/promos',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.rma.enabled',
    namespace: 'store',
    area: 'rma',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Returns flow',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3C) Services (3D printing)
  {
    key: 'store.upload.enabled',
    namespace: 'store',
    area: 'upload',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'STL upload feature (kill switch)',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.upload.preview_3d',
    namespace: 'store',
    area: 'upload',
    feature: 'preview_3d',
    type: 'percentage',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    percentageRollout: 100,
    description: '3D inline viewer',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.quote.heuristic',
    namespace: 'store',
    area: 'quote',
    feature: 'heuristic',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Heuristic quote engine',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.quote.slicer_v1',
    namespace: 'store',
    area: 'quote',
    feature: 'slicer_v1',
    type: 'percentage',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    percentageRollout: 0,
    description: 'Slicer-backed estimates',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.service_orders.enabled',
    namespace: 'store',
    area: 'service_orders',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Convert quote → job',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.service_orders.publish_to_cave',
    namespace: 'store',
    area: 'service_orders',
    feature: 'publish_to_cave',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Send jobs to MakrCave',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3D) Account
  {
    key: 'store.account.wishlist',
    namespace: 'store',
    area: 'account',
    feature: 'wishlist',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Wishlist feature',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.account.subscriptions',
    namespace: 'store',
    area: 'account',
    feature: 'subscriptions',
    type: 'boolean',
    scope: 'global',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Subscriptions/credits',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.account.address_book',
    namespace: 'store',
    area: 'account',
    feature: 'address_book',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Address saving',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // 3E) Admin
  {
    key: 'store.admin.products',
    namespace: 'store',
    area: 'admin',
    feature: 'products',
    type: 'boolean',
    scope: 'role',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Products admin',
    owner: 'store',
    enabledForRoles: ['store_admin', 'superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.admin.orders',
    namespace: 'store',
    area: 'admin',
    feature: 'orders',
    type: 'boolean',
    scope: 'role',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Orders admin',
    owner: 'store',
    enabledForRoles: ['store_admin', 'superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.admin.services',
    namespace: 'store',
    area: 'admin',
    feature: 'services',
    type: 'boolean',
    scope: 'role',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Service orders admin',
    owner: 'store',
    enabledForRoles: ['store_admin', 'superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.admin.reports',
    namespace: 'store',
    area: 'admin',
    feature: 'reports',
    type: 'boolean',
    scope: 'role',
    defaultValue: false,
    rolloutState: 'off',
    description: 'Reports',
    owner: 'store',
    enabledForRoles: ['store_admin', 'superadmin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Ops kill switches
  {
    key: 'store.payments.enabled',
    namespace: 'store',
    area: 'payments',
    feature: 'enabled',
    type: 'boolean',
    scope: 'global',
    defaultValue: true,
    rolloutState: 'on',
    description: 'Payment provider outage kill switch',
    owner: 'store',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Experiment flags (multivariate examples)
export const EXPERIMENT_FLAGS: FlagDefinition[] = [
  {
    key: 'store.search.results_layout',
    namespace: 'store',
    area: 'search',
    feature: 'results_layout',
    type: 'multivariate',
    scope: 'global',
    defaultValue: 'grid',
    rolloutState: 'beta',
    description: 'Search results layout experiment',
    owner: 'store',
    variants: {
      grid: 'grid',
      list: 'list'
    },
    variantWeights: {
      grid: 0.5,
      list: 0.5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'store.product.above_the_fold',
    namespace: 'store',
    area: 'product',
    feature: 'above_the_fold',
    type: 'multivariate',
    scope: 'global',
    defaultValue: 'brief',
    rolloutState: 'beta',
    description: 'Product page above-the-fold experiment',
    owner: 'store',
    variants: {
      brief: 'brief',
      spec_heavy: 'spec-heavy'
    },
    variantWeights: {
      brief: 0.5,
      spec_heavy: 0.5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.provider.job_card_density',
    namespace: 'cave',
    area: 'provider',
    feature: 'job_card_density',
    type: 'multivariate',
    scope: 'global',
    defaultValue: 'compact',
    rolloutState: 'beta',
    description: 'Provider job card density experiment',
    owner: 'cave',
    variants: {
      compact: 'compact',
      cozy: 'cozy'
    },
    variantWeights: {
      compact: 0.5,
      cozy: 0.5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Config flags (typed settings)
export const CONFIG_FLAGS: FlagDefinition[] = [
  {
    key: 'store.quote.material_rates',
    namespace: 'store',
    area: 'quote',
    feature: 'material_rates',
    type: 'config',
    scope: 'global',
    defaultValue: 'v1',
    rolloutState: 'on',
    description: 'Rate table version',
    owner: 'store',
    configValue: 'v1.2.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'cave.reservations.hourly_rate',
    namespace: 'cave',
    area: 'reservations',
    feature: 'hourly_rate',
    type: 'config',
    scope: 'space',
    defaultValue: 100,
    rolloutState: 'on',
    description: 'Default hourly rate for reservations',
    owner: 'cave',
    configValue: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    key: 'global.footer.links',
    namespace: 'global',
    area: 'footer',
    feature: 'links',
    type: 'config',
    scope: 'global',
    defaultValue: [],
    rolloutState: 'on',
    description: 'Footer link configuration',
    owner: 'platform',
    configValue: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
      { label: 'Contact', url: '/contact' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Combine all flags
export const ALL_FLAGS: FlagDefinition[] = [
  ...ORG_FLAGS,
  ...CAVE_FLAGS,
  ...STORE_FLAGS,
  ...EXPERIMENT_FLAGS,
  ...CONFIG_FLAGS
];

export default ALL_FLAGS;
