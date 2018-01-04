function deletePricing(item_id, store_id){
    $.ajax({
        url: '/pricing/' + item_id + '/' + store_id,
        type: 'DELETE',
        statusCode:{
            200: function(result){
                    alert('Pricing successfully deleted.');
                    window.location.reload(true);
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                }
        }
    })
};