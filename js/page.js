$(document).ready(function() {
    $(".title").click(function() {
        $(this).next(".text").slideToggle("fast");
    });
});