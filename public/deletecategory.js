function deleteCategory(id){
    $.ajax({
        url: '/category/' + id,
        type: 'DELETE',
        statusCode:{
            200: function(result){
                    alert('Category successfully deleted.');
                    window.location.reload(true);
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                },
            422: function(result){
                    alert("Cannot delete the category. Foreign key constraint fails.");
                    window.location.reload(true);
                }
        }
    })
};