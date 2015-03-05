
/* 
See https://trello.com/docs for a list of available API URLs
The API development board is at https://trello.com/api
*/

$( document ).ready(function() {
$('.loggedIn').hide();
var getBoards = function (){
	updateLoggedIn();
	$("#boardList").empty();
	Trello.members.get("me", function(member){
	    $(".fullName").text(member.fullName);
	
	    var $boardList = $('<ul class="nav nav-list">')
	        .text("Loading Boards...")
	        .appendTo("#boardList");

	    // Output a list of all of the boards that the member 
	    Trello.get("members/me/boards", {filter: "open"}, function(boards) {
	        $boardList.empty();
	        var output = '<li class="nav-header">Open Boards:</li>';
	        $.each(boards, function(ix, board) {
	        	output += '<li><a data-board-id = "'+board.id+'" href="#">'+board.name+'</a></li>';
	        });  
	        $boardList.html(output);
	        //attach behaviours
	        $('a', $boardList).click( function(){
	        	var id = $(this).data('board-id');
	        	$boardList.find('li').removeClass('active');
	        	$(this).parent().addClass('active');
	        	Trello.boards.get(id, {lists: "open", cards: "visible"}, displayBoard);
	        	return false;
	        });
	    });
	});
}

var displayBoard = function(board){
	var dateString = new Date();
	output = "<h1>"+board.name+"</h1>";
	output += "<div><em>"+dateString.toString('dddd, MMMM ,yyyy')+"</em></div>";
	$.each(board.lists, function (i){
		var idList = this.id;
		output += "<h3>"+this.name+"</h3>";
		output += "<ul>";
		$.each(board.cards, function(i){
			if (this.idList == idList){
        if (this.desc) {
  				output += "<li>"+this.name+"<p>"+marked(this.desc)+"</p></li>";
        }
        else {
  				output += "<li>"+this.name+"</li>";
        }
			}
		});
		output += "</ul>";
	});
	$('#output').html(output);

	//populate save form
	//simple HTML for minimal MS Word damage potential
	$('.saveBoard .boardHtml').val("<html><head></head>"+output+"</html>");
	$('.saveBoard .boardName').val(board.name+'-'+getDateStamp());
	$('.saveBoard').show();
}

var updateLoggedIn = function() {
    var isLoggedIn = Trello.authorized();
    if (isLoggedIn){
    	console.log('logged in');
    	$(".loggedIn").show();     
    	$(".loggedOut").hide();   
    } else {
    	console.log('not logged in');
    	$(".loggedIn").hide();
    	$(".loggedOut").show();
    }   
};

var getDateStamp = function(){
	var d = new Date();
	var year = d.getFullYear();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	return year+'-'+month+'-'+day;
};
    
var logout = function() {
    Trello.deauthorize();
    updateLoggedIn();
};
                          
Trello.authorize({
    interactive:false,
    success: getBoards
});

$("#connectLink")
.click(function(){
    Trello.authorize({
        type: "popup",
        success: getBoards,
        name: 'Trellista'
    })
});

$("#showLink").click(function(){
	console.log('show link clicked');
	Trello.authorize({
	    interactive:false,
	    success: getBoards
	});	
});
    
$("#disconnect").click(logout);

});
