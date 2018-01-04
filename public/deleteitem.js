function deleteItem(id){
    $.ajax({
        url: '/item/' + id,
        type: 'DELETE',
        statusCode:{
            200: function(result){
                    alert('Item successfully deleted.');
                    window.location.reload(true);
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                }
        }
    })
};