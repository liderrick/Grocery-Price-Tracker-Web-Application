function selectItemNameOrder(order){
    if(!order){
        order = "asc";
    }
    $("#item_name_order").val(order);
}

function selectPriceOrder(order){
    if(!order){
        order = "asc";
    }
    $("#price_order").val(order);
}

function selectSearchStore(id){
    if(!id){
        id = "0";
    }
    $("#searchstore").val(id);
}