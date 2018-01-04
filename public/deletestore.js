function deleteStore(id){
    console.log(id);
    $.ajax({
        url: '/store/' + id,
        type: 'DELETE',
        statusCode:{
            200: function(result){
                    alert('Store successfully deleted.');
                    window.location.reload(true);
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                }
        }
    })
};