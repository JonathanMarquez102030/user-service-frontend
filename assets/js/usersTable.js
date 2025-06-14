$(document).ready(function () {
    //get current user
    const userData = JSON.parse(localStorage.getItem('currentUser'));

    if (!userData || !userData.username || !userData.password) {
        showError('No se encontraron credenciales de usuario. Por favor inicie sesión.');
        return;
    }

    const { username, password } = userData;
    let currentFilter = 'all';

    //initialize user datatable and returns its instance
    function initializeDataTable() {
        return $('#usersTable').DataTable({
            "dom": '<"top"<"left-col"l><"right-col"f>>rt<"bottom"<"d-flex flex-md-row flex-column justify-content-between w-100 align-items-center mt-3 mb-1"ip>>',
            "initComplete": function () {
                $('.dataTables_filter').hide();

                const customSearch = `
        <div class="input-group custom-search-box mb-3 mt-2 ms-1" style="max-width: 250px;">
            <input type="text" 
                   class="form-control bg-light border-0 small" 
                   placeholder="Buscar..." 
                   id="customSearchInput">
            <div class="input-group-append">
                <button class="btn btn-primary" type="button" id="customSearchButton">
                    <i class="fas fa-search fa-sm"></i>
                </button>
            </div>
        </div>`;

                $('.right-col').html(customSearch);

                $('#customSearchInput').on('keyup', function () {
                    const value = $('#customSearchInput').val();
                    $('#usersTable').DataTable().search(value).draw();
                });

                $('#customSearchButton').on('click', function () {
                    const value = $('#customSearchInput').val();
                    $('#usersTable').DataTable().search(value).draw();
                });
            },
            "pageLength": 2,
            "lengthChange": false,
            "ajax": {
                "url": getApiUrl(),
                "dataSrc": "",
                "beforeSend": function (xhr) {
                    var base64Credentials = btoa(username + ":" + password);
                    xhr.setRequestHeader("Authorization", "Basic " + base64Credentials);
                },
                "error": function (xhr, error, thrown) {
                    if (xhr.status === 401) {
                        showError('No autorizado: Credenciales incorrectas o expiradas');
                    } else {


                        showError('Error al cargar los datos: ' + (thrown || error));
                    }

                }
            },
            "columns": [
                { "data": "id" },
                { "data": "code" },
                { "data": "kind" },
                {
                    "data": null,
                    "render": function (row) {
                        return row.name + ' ' + row.paternalLastName + (row.maternalLastName ? ' ' + row.maternalLastName : '');
                    }
                },
                { "data": "username" },
                { "data": "password" },
                {
                    "data": "userType", "render": translateUserType
                },
                {
                    "data": "loginStartDate",
                    "render": function (data) {
                        return data ? new Date(data).toLocaleString() : 'No registrado';
                    }
                },
                {
                    "data": "loginEndDate",
                    "render": function (data, row) {
                        return data ? new Date(data).toLocaleString() : (row.loginStartDate ? 'Sesión activa' : 'No registrado');
                    }
                },
                { "data": "sessionDuration" },
                {
                    "data": "status",
                    "render": function (data) {
                        const translatedStatus = translateStatus(data);
                        return '<span class="status-' + data.toLowerCase() + '">' + translatedStatus + '</span>';
                    }
                }
            ],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/2.3.2/i18n/es-ES.json',
            },
            "responsive": true,
            "columnDefs": [
                { "width": "5%", "targets": 0 },
                { "width": "8%", "targets": 1 },
                { "width": "8%", "targets": 2 },
                { "width": "15%", "targets": 3 },
                { "width": "10%", "targets": 4 },
                { "width": "10%", "targets": 5 },
                { "width": "10%", "targets": 6 },
                { "width": "12%", "targets": 7 },
                { "width": "12%", "targets": 8 },
                { "width": "10%", "targets": 9 },
                { "width": "10%", "targets": 10 }
            ]
        });
    }

    //get the api url for user data  with optional type user filter
    function getApiUrl() {
        const filterValue = currentFilter === 'all'
            ? ''
            : `/${currentFilter.toUpperCase()}`;
        return `http://localhost:8080/v1/users${filterValue}`;
    }

    const usersTable = initializeDataTable();


    //handle the type user filter
    $('.filter-option').on('click', function (e) {
        e.preventDefault();

        $('.filter-option').removeClass('active');
        $(this).addClass('active');

        const filterText = $(this).text();
        $('#userTypeFilter').html(`<i class="fas fa-filter me-2"></i>${filterText}`);

        currentFilter = $(this).data('type');

        refreshTableData(usersTable);
    });

    //handle the reload the table and returns the updated data
    $('#refreshDataButton').on('click', function () {
        refreshTableData(usersTable);
    });

    // reload the users table data
    function refreshTableData(table) {
        const refreshButton = $('#refreshDataButton');

        refreshButton.prop('disabled', true);
        refreshButton.html('<i class="fas fa-spinner fa-spin me-2"></i> actualizando...');

        table.ajax.url(getApiUrl()).load(function () {
            refreshButton.prop('disabled', false);
            refreshButton.html('<i class="fas fa-sync-alt me-2"></i> Actualizar datos');
            showSuccess('Datos actualizados correctamente');
        }, false);
    }
});