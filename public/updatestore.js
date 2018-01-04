function updateStore(id){
    $.ajax({
        url: '/store/' + id,
        type: 'PUT',
        data: $('#update-store').serialize(),
        statusCode:{
            200: function(result){
                    alert('Store successfully updated.');
                    window.location.replace("/store");
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                },
            422: function(result){
                    alert('Another store exists with same name. Cannot have duplicate names.');
                    window.location.reload(true);
                }
        }
    })
};