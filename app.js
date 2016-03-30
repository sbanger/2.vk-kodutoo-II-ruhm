(function(){
   "use strict";
   var player;
   var Muusikapurk = function(){

     // SEE ON SINGLETON PATTERN
     if(Muusikapurk.instance){
       return Muusikapurk.instance;
     }
     //this viitab Muusikapurk fn
     Muusikapurk.instance = this;


     this.routes = Muusikapurk.routes;
     // this.routes['home-view'].render()

     console.log('Muusikapurgi sees');

     // KÃƒâ€¢IK muuutujad, mida muudetakse ja on rakendusega seotud defineeritakse siin
     this.click_count = 0;
     this.currentRoute = null;
     console.log(this);

     // hakkan hoidma kÃƒÂµiki purke
     this.jars = [];

     // Kui tahan Moosipurgile referenci siis kasutan THIS = MOOSIPURGI RAKENDUS ISE
     this.init();
   };

   window.Muusikapurk = Muusikapurk; // Paneme muuutja kÃƒÂ¼lge

   Muusikapurk.routes = {
     'home-view': {
       'render': function(){
         // kÃƒÂ¤ivitame siis kui lehte laeme
         console.log('>>>>avaleht');
       }
     },
     'list-view': {
       'render': function(){
         // kÃƒÂ¤ivitame siis kui lehte laeme
         console.log('>>>>loend');

         //simulatsioon laeb kaua
         window.setTimeout(function(){
           document.querySelector('.loading').innerHTML = 'laetud!';
         }, 3000);

       }
     },
     'manage-view': {
       'render': function(){
         // kÃƒÂ¤ivitame siis kui lehte laeme
       }
     }
   };

   // KÃƒÂµik funktsioonid lÃƒÂ¤hevad Moosipurgi kÃƒÂ¼lge
   Muusikapurk.prototype = {
		player : null,
		currentPlaylist: [],


     init: function(){
       console.log('Rakendus lÃƒÂ¤ks tÃƒÂ¶ÃƒÂ¶le');
	   var currentPlaylistTemp = []; //Ajutine array.

       //kuulan aadressirea vahetust
       window.addEventListener('hashchange', this.routeChange.bind(this));

       // kui aadressireal ei ole hashi siis lisan juurde
       if(!window.location.hash){
         window.location.hash = 'home-view';
         // routechange siin ei ole vaja sest kÃƒÂ¤sitsi muutmine kÃƒÂ¤ivitab routechange event'i ikka
       }else{
         //esimesel kÃƒÂ¤ivitamisel vaatame urli ÃƒÂ¼le ja uuendame menÃƒÂ¼ÃƒÂ¼d
         this.routeChange();
       }

       //saan kÃƒÂ¤tte purgid localStorage kui on
       if(localStorage.jars){
           //vÃƒÂµtan stringi ja teen tagasi objektideks
           this.jars = JSON.parse(localStorage.jars);
           console.log('laadisin localStorageist massiiivi ' + this.jars.length);

           //tekitan loendi htmli
           this.jars.forEach(function(jar){
               var new_jar = new Jar(jar.id, jar.title, jar.link);
               var li = new_jar.createHtmlElement();
               document.querySelector('.list-of-jars').appendChild(li);
           });
       }else{
		   //kÃƒÂ¼sin AJAXIGA
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (xhttp.readyState == 4 && xhttp.status == 200) {

					console.log(xhttp.responseText);
					//tekst -> objekktideks
					Muusikapurk.instance.jars = JSON.parse(xhttp.responseText);
					console.log(Muusikapurk.instance.jars);

					//teen purgid htmli
					Muusikapurk.instance.jars.forEach(function(jar){
					   //Lisan youtube playlisti, mis sisestatakse videomÃ¤ngijasse.
						var id = jar.link.split("?v="),
							id = id[1];
							//LÃ¼kkame arraysse video ID
						currentPlaylistTemp.push(id);

					   var new_jar = new Jar(jar.id, jar.title, jar.link);
					   var li = new_jar.createHtmlElement();
					   document.querySelector('.list-of-jars').appendChild(li);

				   });

				   //salvestan localStoragisse
				   localStorage.setItem('jars', JSON.stringify(Muusikapurk.instance.jars));


				}
			};
			xhttp.open("GET", "save.php", true);
			xhttp.send();


	   }
	   //Lisan temp array pÃµhiarraysse
	   this.updatePlaylist();
	   //Loome videomÃ¤ngija.
	   this.startPlayer();
	    // esimene loogika oleks see, et kuulame hiireklikki nupul
       this.bindEvents();

     },
	 updatePlaylist: function(){
		var currentPlaylistTemp = []; //AJutine array
		this.jars.forEach(function(jar){
			//Lisan youtube playlisti, mis sisestatakse videomÃ¤ngijasse.
			var id = jar.link.split("?v="),
				id = id[1];
				//LÃ¼kkame arraysse video ID
			currentPlaylistTemp.push(id);
		 });

		//KÃµik videod on lisautud uute playlisti. MÃ¤Ã¤rame selle playlisti ka mÃ¤ngija playlistiks.
		this.currentPlaylist = currentPlaylistTemp;
	 },
	 startPlayer: function(){
		var that = this;
		this.player = new YT.Player('player', {
			  height: '390',
			  width: '640',
			  playerVars: { 'autoplay': 1, 'controls': 1, 'playlist': that.currentPlaylist.join(",")},
		});
	 },

     bindEvents: function(){
		document.querySelector('.add-new-jar').addEventListener('click', this.addNewClick.bind(this));

		//kuulan trÃƒÂ¼kkimist otsikastis
		document.querySelector('#search').addEventListener('keyup', this.search.bind(this));
     },

	 deleteJar: function(event){

		// millele vajutasin SPAN
		console.log(event.target);

		// tema parent ehk mille sees ta on LI
		console.log(event.target.parentNode);

		//mille sees see on UL
		console.log(event.target.parentNode.parentNode);

		//id
		console.log(event.target.dataset.id);

		var c = confirm("Oled kindel?");

		// vajutas no, pani ristist kinni
		if(!c){	return; }

		//KUSTUTAN
		console.log('kustutan');

		// KUSTUTAN HTMLI
		var ul = event.target.parentNode.parentNode;
		var li = event.target.parentNode;

		ul.removeChild(li);

		//KUSTUTAN OBJEKTI ja uuenda localStoragit

		var delete_id = event.target.dataset.id;

		for(var i = 0; i < this.jars.length; i++){

			if(this.jars[i].id == delete_id){
				//see on see
				//kustuta kohal i objekt ÃƒÂ¤ra
				this.jars.splice(i, 1);
				break;
			}
		}

		localStorage.setItem('jars', JSON.stringify(this.jars));



	 },
     search: function(event){
         //otsikasti vÃƒÂ¤ÃƒÂ¤rtus
         var needle = document.querySelector('#search').value.toLowerCase();
         console.log(needle);

         var list = document.querySelectorAll('ul.list-of-jars li');
         console.log(list);

         for(var i = 0; i < list.length; i++){

             var li = list[i];

             // ÃƒÂ¼he listitemi sisu tekst
             var stack = li.querySelector('.content').innerHTML.toLowerCase();

             //kas otsisÃƒÂµna on sisus olemas
             if(stack.indexOf(needle) !== -1){
                 //olemas
                 li.style.display = 'list-item';

             }else{
                 //ei ole, index on -1, peidan
                 li.style.display = 'none';

             }

         }
     },

     addNewClick: function(event){
       //salvestame purgi
       //console.log(event);

       var title = document.querySelector('.title').value;
       var link = document.querySelector('.link').value;

       //console.log(title + ' ' + link);
       //1) tekitan uue Jar'i
	     var id = guid();
       var new_jar = new Jar(id, title, link);

       //lisan massiiivi purgi
       this.jars.push(new_jar);
       console.log(JSON.stringify(this.jars));
       // JSON'i stringina salvestan localStorage'isse
       localStorage.setItem('jars', JSON.stringify(this.jars));


		//AJAX
		var xhttp = new XMLHttpRequest();

		//mis juhtub kui pÃƒÂ¤ring lÃƒÂµppeb
		xhttp.onreadystatechange = function() {

			console.log(xhttp.readyState);

			if (xhttp.readyState == 4 && xhttp.status == 200) {

				console.log(xhttp.responseText);
			}
		};

		//teeb pÃƒÂ¤ringu
		xhttp.open("GET", "save.php?id="+id+"&title="+title+"&link="+link, true);
		xhttp.send();


       // 2) lisan selle htmli listi juurde
       var li = new_jar.createHtmlElement();
       document.querySelector('.list-of-jars').appendChild(li);


     },

     routeChange: function(event){

       //kirjutan muuutujasse lehe nime, vÃƒÂµtan maha #
       this.currentRoute = location.hash.slice(1);
       console.log(this.currentRoute);

       //kas meil on selline leht olemas?
       if(this.routes[this.currentRoute]){

         //muudan menÃƒÂ¼ÃƒÂ¼ lingi aktiivseks
         this.updateMenu();

         this.routes[this.currentRoute].render();


       }else{
         /// 404 - ei olnud
       }


     },

     updateMenu: function() {
       //http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
       //1) vÃƒÂµtan maha aktiivse menÃƒÂ¼ÃƒÂ¼lingi kui on
       document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '');

       //2) lisan uuele juurde
       //console.log(location.hash);
       document.querySelector('.'+this.currentRoute).className += ' active-menu';

     }

   }; // MOOSIPURGI LÃƒâ€¢PP

   var Jar = function(new_id, new_title, new_link){
	 this.id = new_id;
     this.title = new_title;
     this.link = new_link;
     console.log('created new jar');
   };

   Jar.prototype = {
     createHtmlElement: function(){

       // vÃƒÂµttes title ja link ->
       /*
       li
        span.letter
          M <- title esimene tÃƒÂ¤ht
        span.content
          title | link
       */

       var li = document.createElement('li');

       var span = document.createElement('span');
       span.className = 'letter';

       var letter = document.createTextNode(this.title.charAt(0));
       span.appendChild(letter);

       li.appendChild(span);

       var span_with_content = document.createElement('span');
       span_with_content.className = 'content';

       var content = document.createTextNode(this.title + ' | ' + this.link);
       span_with_content.appendChild(content);

       li.appendChild(span_with_content);

	   //DELETE nupp
	   var span_delete = document.createElement('span');
	   span_delete.style.color = "red";
	   span_delete.style.cursor = "pointer";

	   //kustutamiseks panen id kaasa
	   span_delete.setAttribute("data-id", this.id);

	   span_delete.innerHTML = " Delete";

	   li.appendChild(span_delete);

	   //keegi vajutas nuppu
	   span_delete.addEventListener("click", Muusikapurk.instance.deleteJar.bind(Muusikapurk.instance));

       return li;

     }
   };

   //HELPER
   function guid(){
		var d = new Date().getTime();
		if(window.performance && typeof window.performance.now === "function"){
			d += performance.now(); //use high-precision timer if available
		}
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	}

   // kui leht laetud kÃƒÂ¤ivitan Moosipurgi rakenduse
   window.onload = function(){
     var app = new Muusikapurk();
   };

})();
