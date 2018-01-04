function updatePricing(item_id, store_id){
    $.ajax({
        url: '/pricing/' + item_id + '/' + store_id,
        type: 'PUT',
        data: $('#update-pricing').serialize(),
        statusCode:{
            200: function(result){
                    alert('Pricing successfully updated.');
                    window.location.replace("/pricing");
                },
            400: function(result){
                    alert(result.responseText);
                    window.location.reload(true);
                }
        }
    })
};