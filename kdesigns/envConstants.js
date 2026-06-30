
module.exports = {
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
  MF_LOCAL: {
    USER_MANAGEMENT: `kn_userManagement@${process.env.REACT_APP_USER_MANAGEMENT_REMOTE_ENTRY_URL}`,
  },
  MF_SERVER: {
    USER_MANAGEMENT: `kn_userManagement@${process.env.REACT_APP_USER_MANAGEMENT_REMOTE_ENTRY_URL}`,
  },
};