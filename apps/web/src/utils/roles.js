export const roleHomes = {
  citizen: '/citizen',
  officer: '/workbench',
  admin: '/admin'
};

export const roleLabels = {
  citizen: 'Citizen Portal',
  officer: 'Officer Workbench',
  admin: 'Administration Console'
};

export const getRoleHome = (role) => roleHomes[role] || '/citizen';

export const getRoleLabel = (role) => roleLabels[role] || roleLabels.citizen;