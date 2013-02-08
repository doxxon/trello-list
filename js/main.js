
/* 
See https://trello.com/docs for a list of available API URLs
The API development board is at https://trello.com/api
*/

$( document ).ready(function() {

	Trello.authorize({
	    interactive:false,
	    success: getBoards,
	    name: 'Trello-List'
	});
	updateLoggedIn();
	
	$("#disconnect").click(logout());	

	$("#connectLink")
	.click(function(){
		if (Trello.authorized()){
			displayBoards();
		} else {
		    Trello.authorize({
		        type: "popup",
		        success: getBoards(),
		        name: 'Trello-List',
		    })
			
		}
	});

});
	
function updateLoggedIn() {
    var isLoggedIn = Trello.authorized();
    if (isLoggedIn){
    	$(".loggedIn").show();     
    	$(".loggedOut").hide();   
    } else {
    	$(".loggedIn").hide();
    	$(".loggedOut").show();
    }
};

function onAuthorize() {
    updateLoggedIn();
    $("#output").empty();
    
    Trello.members.get("me", function(member){
        $("#fullName").text(member.fullName);
    
        var $cards = $("<div>")
            .text("Loading Cards...")
            .appendTo("#output");

        // Output a list of all of the cards that the member 
        // is assigned to
        Trello.get("members/me/cards", function(cards) {
            $cards.empty();
            $.each(cards, function(ix, card) {
                $("<a>")
                .attr({href: card.url, target: "trello"})
                .addClass("card")
                .text(card.name)
                .appendTo($cards);
            });  
        });
    });

};

function getBoards(){
	updateLoggedIn();
	$("#boardList").empty();
	Trello.members.get("me", function(member){
	    $("#fullName").text(member.fullName);
	
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

function displayBoard(board){
	var dateString = new Date();
	output = "<h1>"+board.name+"</h1>";
	output += "<div><em>"+dateString.toString('dddd, MMMM ,yyyy')+"</em></div>";
	$.each(board.lists, function (i){
		var idList = this.id;
		output += "<h3>"+this.name+"</h3>";
		output += "<ul>";
		$.each(board.cards, function(i){
			if (this.idList == idList){
				output += "<li>"+this.name+"</li>";
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

function getDateStamp(){
	var d = new Date();
	var year = d.getFullYear();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	return year+'-'+month+'-'+day;
}

function logout() {
    Trello.deauthorize();
    updateLoggedIn();
    return false;
};
                         