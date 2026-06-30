const authService = require('../services/authService');

async function login(req, res) {
  const result = await authService.login(req.body);
  res.json({ success: true, data: result });
}

async function getMe(req, res) {
  const user = await authService.getMe(req.user.id);
  res.json({ success: true, data: user });
}

async function updateProfile(req, res) {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: user });
}

async function changePassword(req, res) {
  const result = await authService.changePassword(req.user.id, req.body);
  res.json({ success: true, data: result });
}

module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
};
