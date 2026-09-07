export const PERMISSIONS = {
  // Users & Customer Management
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_SUSPEND: 'users.suspend',
  USERS_ACTIVATE: 'users.activate',
  USERS_VERIFY: 'users.verify',
  USERS_RESET_PASSWORD: 'users.reset_password',
  USERS_IMPERSONATE: 'users.impersonate',
  USERS_VIEW_ACTIVITY: 'users.view_activity',
  USERS_VIEW_LOGIN_HISTORY: 'users.view_login_history',
  USERS_MANAGE_SESSIONS: 'users.manage_sessions',
  USERS_CHANGE_ROLE: 'users.change_role',
  USERS_MANAGE_PERMISSIONS: 'users.manage_permissions',

  // Shipments & Edit Everything Control
  SHIPMENTS_VIEW: 'shipments.view',
  SHIPMENTS_CREATE: 'shipments.create',
  SHIPMENTS_EDIT: 'shipments.edit',
  SHIPMENTS_DELETE: 'shipments.delete',
  SHIPMENTS_CANCEL: 'shipments.cancel',
  SHIPMENTS_RESTORE: 'shipments.restore',
  SHIPMENTS_ARCHIVE: 'shipments.archive',
  SHIPMENTS_ASSIGN: 'shipments.assign',
  SHIPMENTS_REASSIGN: 'shipments.reassign',
  SHIPMENTS_CHANGE_STATUS: 'shipments.change_status',
  SHIPMENTS_CHANGE_SERVICE: 'shipments.change_service',
  SHIPMENTS_CHANGE_PRICE: 'shipments.change_price',
  SHIPMENTS_CHANGE_WEIGHT: 'shipments.change_weight',
  SHIPMENTS_CHANGE_DIMENSIONS: 'shipments.change_dimensions',
  SHIPMENTS_CHANGE_SENDER: 'shipments.change_sender',
  SHIPMENTS_CHANGE_RECIPIENT: 'shipments.change_recipient',
  SHIPMENTS_MANAGE_ITEMS: 'shipments.manage_items',
  SHIPMENTS_MANAGE_DOCUMENTS: 'shipments.manage_documents',
  SHIPMENTS_GENERATE_LABEL: 'shipments.generate_label',
  SHIPMENTS_EXPORT: 'shipments.export',

  // Tracking Overrides & Events
  TRACKING_VIEW: 'tracking.view',
  TRACKING_CREATE: 'tracking.create',
  TRACKING_EDIT: 'tracking.edit',
  TRACKING_DELETE: 'tracking.delete',
  TRACKING_ADD_EVENT: 'tracking.add_event',
  TRACKING_EDIT_EVENT: 'tracking.edit_event',
  TRACKING_DELETE_EVENT: 'tracking.delete_event',
  TRACKING_OVERRIDE_STATUS: 'tracking.override_status',
  TRACKING_CORRECT_LOCATION: 'tracking.correct_location',
  TRACKING_CORRECT_TIMESTAMP: 'tracking.correct_timestamp',
  TRACKING_IMPORT_EVENTS: 'tracking.import_events',
  TRACKING_EXPORT: 'tracking.export',

  // Receipts Engine
  RECEIPTS_VIEW: 'receipts.view',
  RECEIPTS_CREATE: 'receipts.create',
  RECEIPTS_EDIT: 'receipts.edit',
  RECEIPTS_DELETE: 'receipts.delete',
  RECEIPTS_GENERATE: 'receipts.generate',
  RECEIPTS_REGENERATE: 'receipts.regenerate',
  RECEIPTS_DOWNLOAD: 'receipts.download',
  RECEIPTS_PRINT: 'receipts.print',
  RECEIPTS_EMAIL: 'receipts.email',
  RECEIPTS_EXPORT: 'receipts.export',
  RECEIPTS_VOID: 'receipts.void',
  RECEIPTS_RESTORE: 'receipts.restore',

  // Invoices & Financials
  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_EDIT: 'invoices.edit',
  INVOICES_DELETE: 'invoices.delete',
  INVOICES_GENERATE: 'invoices.generate',
  INVOICES_DOWNLOAD: 'invoices.download',
  INVOICES_SEND_REMINDER: 'invoices.send_reminder',
  INVOICES_MARK_PAID: 'invoices.mark_paid',
  INVOICES_VOID: 'invoices.void',
  INVOICES_EXPORT: 'invoices.export',

  // Payments & Verification
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_EDIT: 'payments.edit',
  PAYMENTS_VERIFY: 'payments.verify',
  PAYMENTS_MARK_PAID: 'payments.mark_paid',
  PAYMENTS_CANCEL: 'payments.cancel',
  PAYMENTS_EXPORT: 'payments.export',

  // Refund Workflows
  REFUNDS_VIEW: 'refunds.view',
  REFUNDS_CREATE: 'refunds.create',
  REFUNDS_APPROVE: 'refunds.approve',
  REFUNDS_EXECUTE: 'refunds.execute',
  REFUNDS_CANCEL: 'refunds.cancel',
  REFUNDS_EXPORT: 'refunds.export',

  // Tariff Engine & Pricing
  PRICING_VIEW: 'pricing.view',
  PRICING_CREATE: 'pricing.create',
  PRICING_EDIT: 'pricing.edit',
  PRICING_DELETE: 'pricing.delete',
  PRICING_PUBLISH: 'pricing.publish',
  PRICING_DISABLE: 'pricing.disable',
  PRICING_IMPORT: 'pricing.import',
  PRICING_EXPORT: 'pricing.export',

  // Coupons & Rewards
  COUPONS_VIEW: 'coupons.view',
  COUPONS_CREATE: 'coupons.create',
  COUPONS_EDIT: 'coupons.edit',
  COUPONS_DELETE: 'coupons.delete',
  COUPONS_ACTIVATE: 'coupons.activate',

  // Drivers & Fleet Operations
  DRIVERS_VIEW: 'drivers.view',
  DRIVERS_CREATE: 'drivers.create',
  DRIVERS_EDIT: 'drivers.edit',
  DRIVERS_DELETE: 'drivers.delete',
  DRIVERS_ACTIVATE: 'drivers.activate',
  DRIVERS_SUSPEND: 'drivers.suspend',
  DRIVERS_ASSIGN: 'drivers.assign',

  // Facilities & Warehouses
  FACILITIES_VIEW: 'facilities.view',
  FACILITIES_CREATE: 'facilities.create',
  FACILITIES_EDIT: 'facilities.edit',
  FACILITIES_DELETE: 'facilities.delete',
  FACILITIES_MANAGE_STAFF: 'facilities.manage_staff',

  // Dispatch & Routes
  DISPATCH_VIEW: 'dispatch.view',
  DISPATCH_CREATE: 'dispatch.create',
  DISPATCH_EDIT: 'dispatch.edit',
  DISPATCH_ASSIGN_DRIVER: 'dispatch.assign_driver',
  DISPATCH_CREATE_ROUTE: 'dispatch.create_route',

  // Warehouse Package Scanning
  WAREHOUSE_VIEW: 'warehouse.view',
  WAREHOUSE_RECEIVE: 'warehouse.receive',
  WAREHOUSE_SCAN: 'warehouse.scan',
  WAREHOUSE_SORT: 'warehouse.sort',
  WAREHOUSE_TRANSFER: 'warehouse.transfer',

  // Customer Support & Tickets
  SUPPORT_VIEW: 'support.view',
  SUPPORT_CREATE: 'support.create',
  SUPPORT_EDIT: 'support.edit',
  SUPPORT_ASSIGN: 'support.assign',
  SUPPORT_REPLY: 'support.reply',
  SUPPORT_CLOSE: 'support.close',

  // Notifications & Announcements
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_SEND: 'notifications.send',
  NOTIFICATIONS_BROADCAST: 'notifications.broadcast',

  // Content Management System
  CMS_VIEW: 'cms.view',
  CMS_CREATE: 'cms.create',
  CMS_EDIT: 'cms.edit',
  CMS_PUBLISH: 'cms.publish',

  // Reports & Analytics
  REPORTS_VIEW: 'reports.view',
  REPORTS_REVENUE: 'reports.revenue',
  REPORTS_SHIPMENTS: 'reports.shipments',
  REPORTS_FINANCIAL: 'reports.financial',

  // System Settings & Security
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_SECURITY: 'settings.security',

  // Admin Management & Audit Logs
  ADMINS_VIEW: 'admins.view',
  ADMINS_CREATE: 'admins.create',
  ADMINS_EDIT: 'admins.edit',
  ADMINS_ASSIGN_ROLE: 'admins.assign_role',
  ADMINS_MANAGE_PERMISSIONS: 'admins.manage_permissions',
  AUDIT_VIEW: 'audit.view',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type PermissionScope = 'GLOBAL' | 'REGION' | 'FACILITY' | 'DEPARTMENT' | 'ASSIGNED' | 'OWN'

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  SYSTEM_ADMIN: [
    PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.USERS_EDIT, PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_VERIFY, PERMISSIONS.USERS_RESET_PASSWORD, PERMISSIONS.USERS_IMPERSONATE,
    PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT, PERMISSIONS.SETTINGS_SECURITY,
    PERMISSIONS.ADMINS_VIEW, PERMISSIONS.ADMINS_CREATE, PERMISSIONS.ADMINS_EDIT,
    PERMISSIONS.ADMINS_ASSIGN_ROLE, PERMISSIONS.ADMINS_MANAGE_PERMISSIONS, PERMISSIONS.AUDIT_VIEW,
  ],
  OPERATIONS_ADMIN: [
    PERMISSIONS.SHIPMENTS_VIEW, PERMISSIONS.SHIPMENTS_CREATE, PERMISSIONS.SHIPMENTS_EDIT,
    PERMISSIONS.SHIPMENTS_CANCEL, PERMISSIONS.SHIPMENTS_ASSIGN, PERMISSIONS.SHIPMENTS_CHANGE_STATUS,
    PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_ADD_EVENT, PERMISSIONS.TRACKING_OVERRIDE_STATUS,
    PERMISSIONS.DRIVERS_VIEW, PERMISSIONS.DRIVERS_ASSIGN, PERMISSIONS.FACILITIES_VIEW,
    PERMISSIONS.DISPATCH_VIEW, PERMISSIONS.DISPATCH_ASSIGN_DRIVER, PERMISSIONS.WAREHOUSE_VIEW,
    PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_SHIPMENTS,
  ],
  SHIPPING_MANAGER: [
    PERMISSIONS.SHIPMENTS_VIEW, PERMISSIONS.SHIPMENTS_CREATE, PERMISSIONS.SHIPMENTS_EDIT,
    PERMISSIONS.SHIPMENTS_ASSIGN, PERMISSIONS.SHIPMENTS_CHANGE_STATUS, PERMISSIONS.SHIPMENTS_GENERATE_LABEL,
    PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_ADD_EVENT,
  ],
  FINANCE_ADMIN: [
    PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_VERIFY, PERMISSIONS.PAYMENTS_MARK_PAID,
    PERMISSIONS.RECEIPTS_VIEW, PERMISSIONS.RECEIPTS_GENERATE, PERMISSIONS.RECEIPTS_EDIT, PERMISSIONS.RECEIPTS_VOID,
    PERMISSIONS.INVOICES_VIEW, PERMISSIONS.INVOICES_GENERATE, PERMISSIONS.INVOICES_MARK_PAID,
    PERMISSIONS.REFUNDS_VIEW, PERMISSIONS.REFUNDS_CREATE, PERMISSIONS.REFUNDS_APPROVE, PERMISSIONS.REFUNDS_EXECUTE,
    PERMISSIONS.PRICING_VIEW, PERMISSIONS.PRICING_EDIT, PERMISSIONS.COUPONS_VIEW, PERMISSIONS.COUPONS_CREATE,
    PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_REVENUE, PERMISSIONS.REPORTS_FINANCIAL,
  ],
  DISPATCHER: [
    PERMISSIONS.SHIPMENTS_VIEW, PERMISSIONS.SHIPMENTS_ASSIGN, PERMISSIONS.TRACKING_VIEW,
    PERMISSIONS.DRIVERS_VIEW, PERMISSIONS.DRIVERS_ASSIGN, PERMISSIONS.DISPATCH_VIEW,
    PERMISSIONS.DISPATCH_ASSIGN_DRIVER, PERMISSIONS.DISPATCH_CREATE_ROUTE,
  ],
  WAREHOUSE_MANAGER: [
    PERMISSIONS.SHIPMENTS_VIEW, PERMISSIONS.TRACKING_VIEW, PERMISSIONS.TRACKING_ADD_EVENT,
    PERMISSIONS.FACILITIES_VIEW, PERMISSIONS.WAREHOUSE_VIEW, PERMISSIONS.WAREHOUSE_RECEIVE,
    PERMISSIONS.WAREHOUSE_SCAN, PERMISSIONS.WAREHOUSE_SORT, PERMISSIONS.WAREHOUSE_TRANSFER,
  ],
  CUSTOMER_SUPPORT_ADMIN: [
    PERMISSIONS.USERS_VIEW, PERMISSIONS.SHIPMENTS_VIEW, PERMISSIONS.TRACKING_VIEW,
    PERMISSIONS.SUPPORT_VIEW, PERMISSIONS.SUPPORT_CREATE, PERMISSIONS.SUPPORT_REPLY, PERMISSIONS.SUPPORT_CLOSE,
    PERMISSIONS.NOTIFICATIONS_VIEW, PERMISSIONS.NOTIFICATIONS_SEND,
  ],
  FINANCE_STAFF: [
    PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_VERIFY, PERMISSIONS.RECEIPTS_VIEW,
    PERMISSIONS.RECEIPTS_GENERATE, PERMISSIONS.INVOICES_VIEW, PERMISSIONS.REFUNDS_VIEW,
    PERMISSIONS.REFUNDS_CREATE, PERMISSIONS.REPORTS_VIEW,
  ],
  CONTENT_ADMIN: [
    PERMISSIONS.CMS_VIEW, PERMISSIONS.CMS_CREATE, PERMISSIONS.CMS_EDIT, PERMISSIONS.CMS_PUBLISH,
  ],
  READ_ONLY_ADMIN: [
    PERMISSIONS.USERS_VIEW, PERMISSIONS.SHIPMENTS_VIEW, PERMISSIONS.TRACKING_VIEW,
    PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.RECEIPTS_VIEW, PERMISSIONS.INVOICES_VIEW,
    PERMISSIONS.DRIVERS_VIEW, PERMISSIONS.FACILITIES_VIEW, PERMISSIONS.REPORTS_VIEW,
  ],
}

export function hasPermission(role: string, permission: Permission, customPermissions?: Permission[]): boolean {
  if (role === 'SUPER_ADMIN') return true
  if (customPermissions && customPermissions.includes(permission)) return true
  const allowed = ROLE_PERMISSIONS[role] || []
  return allowed.includes(permission)
}