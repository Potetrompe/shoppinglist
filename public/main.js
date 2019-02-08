$(document).ready(function(){

    //? Gross jQuery
    $(".deleteItem").on("click", function(e){
        var inputVal = document.getElementById("deleteField").value;
        $.ajax({
            type: "DELETE",
            url : "/" + inputVal,
            success: function(res){
                alert("deleting");
                window.location.href="/";
            },
            error: function(err){
                console.log(err);
                alert(err);
            }
        });
    });

    //? Normal JS

    const feed      = document.getElementById("feed");
    const btnDelete = document.getElementById("btnDelete");



});



