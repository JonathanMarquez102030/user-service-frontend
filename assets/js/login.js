$(document).ready(function () {

    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData && userData.username && userData.password) {
        window.location.href = '/index.html';
        return; // Salir para evitar ejecutar el resto del código
    }

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        //Retrieves the login data
        const username = $('#inptUserName').val();
        const password = $('#inptPassword').val();

        //validates login fields
        if (!username || !password) {
            $('#errorMessage').text('Por favor ingrese el  usuario y contraseña').show();
            return;
        }

        //shows a loading button while is processig the information
        $('button[type="submit"]').prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> cargando...');


        // ajax request to login
        $.ajax({
            url: 'http://localhost:8080/v1/auth/login', 
            type: 'POST',
            beforeSend: function(xhr) {
                var base64Credentials = btoa(username + ":" + password);
                xhr.setRequestHeader("Authorization", "Basic " + base64Credentials);
            },
            success: function(userData) {  
                //saves user data in local storage and redirect to index page             
                localStorage.setItem('currentUser', JSON.stringify(userData));
                window.location.href = '/index.html';
            },
            error: function(xhr) {
                //handle a invalid login or an error
                $('button[type="submit"]').prop('disabled', false).text('Iniciar sesión');               
                let errorMsg = 'Error en el login';
                if (xhr.status === 401 || xhr.status === 0) {
                    console.log("entro al 401");
                    
                    errorMsg = 'Usuario o contraseña incorrectos';
                } else if (xhr.status === 404) {
                    errorMsg = 'Usuario no encontrado';
                } else if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                }
                
                $('#errorMessage').text(errorMsg).show();
            }
        });
    });
});

