export const pathTitleMap = {
    '/dashboard': 'Dashboard ',
    '/bookings': 'Manage Bookings',
    '/clients': 'Manage Clients',
    '/drivers': 'Manage Drivers',
    '/reports': 'Reports',
  };



export const getTitleFromPath = (path) => {
    const basePath = '/' + path.split('/')[1];
    return pathTitleMap[basePath] || 'Dashboard';
  };
  