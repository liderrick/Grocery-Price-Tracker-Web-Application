function updateChain(id){
    
    var cname = $('#'+'chain_name'+id).val();
    
    $.ajax({
        url: '/chain/' + id,
        type: 'PUT',
        data: {
            "chain_name": cname
        },
        statusCode:{
            200: function(result){
                    alert('Chain successfully updated.');
                    window.location.reload(true);
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                },
            422: function(result){
                    alert('Another chain exists with same name. Cannot have duplicate names.');
                    window.location.reload(true);
                }
        }
    })
 
    
};