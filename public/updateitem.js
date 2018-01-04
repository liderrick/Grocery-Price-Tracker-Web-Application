function updateItem(id){
    $.ajax({
        url: '/item/' + id,
        type: 'PUT',
        data: $('#update-item').serialize(),
        statusCode:{
            200: function(result){
                    alert('Item successfully updated.');
                    window.location.replace("/item");
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                },
            406: function(result){
                    alert('At least one category must be chosen.');
                    window.location.reload(true);
                },
            422: function(result){
                    alert('Another item exists with same name. Cannot have duplicate names.');
                    window.location.reload(true);
                }
        }
    })
};