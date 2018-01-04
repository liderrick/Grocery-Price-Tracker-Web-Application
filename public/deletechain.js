function deleteChain(id){
    $.ajax({
        url: '/chain/' + id,
        type: 'DELETE',
        statusCode:{
            200: function(result){
                    alert('Chain successfully deleted.');
                    window.location.reload(true);
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                },
            422: function(result){
                    alert("Can't delete the chain: foreign key constraint fails");
                    window.location.reload(true);
                }
        }
    })
};