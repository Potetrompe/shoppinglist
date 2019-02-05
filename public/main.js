$(document).ready(function(){
    console.log("to main.js");
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
});