$(document).ready(function () {
  const userData = JSON.parse(localStorage.getItem('currentUser'));

  if (!userData) {
    window.location.href = '/login.html';
    return;
  }

  showUserData(userData);
});


// show the current user data 
function showUserData(user) {
  $('#userCode').text(user.code || 'N/A');
  $('#nameTopBar').text(user.name || 'N/A');
  $('#userUsername').text(user.username || 'N/A');
  $('#userFullName').text(`${user.name} ${user.paternalLastName} ${user.maternalLastName}`);
  $('#userType').text(translateUserType(user.userType));
  $('#userStatus').text(translateStatus(user.status));
  $('#userSessionDuration').text(user.sessionDuration || 'N/A');

  const startDate = user.loginStartDate ? new Date(user.loginStartDate).toLocaleString() : 'N/A';
  $('#userLoginStart').text(startDate);
}

function translateUserType(userType) {
  const translations = {
    "ADMINISTRATOR": "Administrador",
    "AGENT": "Agente",
    "PROMOTER": "Promotor"
  };
  return translations[userType] || userType;
}

function translateStatus(status) {
  const translations = {
    "ACTIVE": "Activo",
    "INACTIVE": "Inactivo"
  };
  return translations[status] || status;
}

function showError(message) {
  showAlert(message, 'danger');
}

function showSuccess(message) {
  showAlert(message, 'success');
}

function showAlert(message, type = 'success') {
  const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>

            </div>
        `;

  $('#alertContainer').html(alertHtml);
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/login.html';
}