export const getRoleRedirect = (roles: string[] = []): string => {
  const prioritizedRoles = [
    'super_admin',
    'admin',
    'makerspace_admin',
    'service_provider',
  ];

  const role = prioritizedRoles.find((r) => roles.includes(r)) ?? 'user';

  switch (role) {
    case 'super_admin':
      return '/admin';
    case 'admin':
      return '/org/home';
    case 'makerspace_admin':
      return '/portal';
    case 'service_provider':
      return '/jobs';
    default:
      return '/dashboard';
  }
};
