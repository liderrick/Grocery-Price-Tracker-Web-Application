function updateCategory(id){
    
    var cname = $('#category_name'+id).val();
    
    $.ajax({
        url: '/category/' + id,
        type: 'PUT',
        data: {
            "category_name": cname
        },
        statusCode:{
            200: function(result){
                    alert('Category successfully updated.');
                    window.location.reload(true);
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                },
            422: function(result){
                    alert('Another category exists with same name. Cannot have duplicate names.');
                    window.location.reload(true);
                }
        }
    })
};