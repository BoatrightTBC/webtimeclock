//GLOBAL VARIABLES
var emplLetters = "";
var emplList = "";
var cardList = "";
var emplName = "";
var prempl = "";
var cardno = "";
var prfirst = "";
var prlast = "";
var supeid = "";
var workdate = "";
var timein = "";
var timeout = "";
var jobcode = "";
var isMgr = "0";
var Msg = "";
var Custs;
var Conts;
var Tasks;
var whichGet = "";
var HasClockIn = "";
var CameFromEmpls = "no";
var dialoganswer; 
var backData = "";
var jsonData;
var reccount;
var setupName = "";
var showcust;
var cardsource;

var timeslice;
var breakpoint;
var compno;
var token = "";
var h;
var m;
var s;
var lnMin = 0;
var lnHour = 0;
var once = 1;
var dialog_buttons = {};

findPath();

function findPath() {
	var winPath = window.location.pathname;
    path = winPath.replace("index.html", "");
}

function badLogin() {
  doalert("You need to log in first.", "Error")
  $("#cardcontainer").hide();
  $("#logincontainer").show();
}

function logOut() {
  $(location).attr('href','/authportal/index.html');
}

///////////////////////////////////////////// INIT FUNCTIONS /////////////////////////////////////////////////////////
function loadSysdata() {
    $("#logincontainer").hide();
	var formData2 = {safety:token}; //Array 
	$.ajax({
	    url : path + "getsysdata.php",
	    type: "POST",
	    data : formData2,
	    success: function(data, textStatus, jqXHR)
	    {
			$("#cardcontainer").show();
			$("#logincontainer").hide();
		    var grabJSON = JSON.parse(data);				    
	        var timesliceC = grabJSON[0]['TIMESLICE'];
	        var breakpointC = grabJSON[0]['BREAKPOINT'];
	        compno = grabJSON[0]['COMPNO'];
	        showcust = grabJSON[0]['SHOWCUST'];
	        token = grabJSON[0]['token'];
	        showcust = grabJSON[0]['SHOWCUST'];
	        setupName = grabJSON[0]['SETUPNAME'];
	        cardsource = grabJSON[0]['cardsource'];
            timeslice = parseInt(timesliceC);
            breakpoint = parseInt(breakpointC);
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        badLogin();			 
	    }
	});			
    doclear();	
    startTime();
    return true;
}

function jumpCursor() {		
    lcCursorJump = $('[name=cardinput]');
    lcCursorJump.focus();
}    
///////////////////////////////////////////// END INIT FUNCTIONS /////////////////////////////////////////////////////////

///////////////////////////////////////////// TIME FUNCTIONS /////////////////////////////////////////////////////////
function startTime() {
    var today = new Date();
    var datefield;
    var monthfield;
    var yearfield;
    var totalDate;
    var lcSlice;

    datefield = today.getDate();
    monthfield = (today.getMonth() + 1);
    yearfield = today.getFullYear();
    totalDate = datefield + '/' + monthfield + '/' + yearfield;
    
    h = today.getHours();
    m = today.getMinutes();
    s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('txt').innerHTML = totalDate + ' ' +
    h + ':' + m + ':' + s;
	lcSlice = grabTime();
    document.getElementById('txt2').innerHTML = lcSlice;
    
    var t = setTimeout(startTime, 10000);	// Refresh every 10 seconds
}

function checkTime(i) {
    if (i < 10) {i = '0' + i};  // add zero in front of numbers < 10
    return i;
}

function grabTime() {
	var lcreturn = "";
	var lnMod;
	lnHour = parseInt(h);
	lnMin = parseInt(m);
	
	lnMod = (lnMin % timeslice);	//&& Difference between Time and TimeSlice
	
	switch(true) {
		case (lnMod == 0):	//&& Nothing to do except get it ready
		  break;
	
		case (lnMod >= breakpoint):	//&& Round up if Breakpoint or more
		  lnMin = lnMin - lnMod + timeslice;
		  break;
	
		default: 	//&& Round down otherwise
		  lnMin = lnMin - lnMod;
		  break;
	}  
	
	if (lnMin > 59) {	//&& Bump it to the next hour
		lnMin = (lnMin - 60);
		lnHour = lnHour + 1;
	}
	
	if (lnHour < 10) { 
		lcHour = "0" + lnHour;
	} else {
		lcHour = "" + lnHour;
	}
	
	if (lnMin < 10) { 
		lcMin = "0" + lnMin;
	} else {
		lcMin = "" + lnMin;
	}
	
	if (isNaN(lnMin)){
	  lcreturn = h + ":" + m;
	} else {
	  lcreturn = lcHour + ":" + lcMin;
	}
	
	return lcreturn;
}
///////////////////////////////////////////// END TIME FUNCTIONS /////////////////////////////////////////////////////////

///////////////////////////////////////////// CLOCKIN FUNCTIONS /////////////////////////////////////////////////////////
function checkClockno(pcValue) {
    $.when(clocknoAjax(pcValue)).then(parseClockno);    
}

function clocknoAjax(pcValue) {
    var lcTime = grabTime();
	
	var formData = {safety:token, 
	                clockno: pcValue,
	                timein: lcTime
	                }; //Array 
	 
	return $.ajax({
	    url : path + "checkclockno.php",
	    type: "POST",
	    data : formData,
	    async: false,
	    success: function(data, textStatus, jqXHR)
	    {
	        if (data.indexOf("|") < 0) { 		        
		        Msg = data;
	        } else {
		        lcSplit = data.split("|");
		        HasClockIn = lcSplit[0];
			    var grabJSON = JSON.parse(lcSplit[1]);				    
		        prempl = grabJSON[0]['prempl'];
		        cardno = grabJSON[0]['cardno'];
		        prfirst = grabJSON[0]['prfirst'];
		        prlast = grabJSON[0]['prlast'];
		        supeid = grabJSON[0]['supeid'];
		        isMgr  = grabJSON[0]['ismgr'];
		        emplName = prfirst + " " + prlast;
	        }
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with clocknoAjax call: " + errorThrown, "Error");			 
	    }
	});	
	
}

function parseClockno(pcValue) {
  if (Msg.indexOf("|") < 0 && Msg.length > 0) { 	
    	  doalert(Msg, "Problem");
  } else {
	if (isMgr == '1') {
      $( "#cardswipe" ).hide("slow");
      showButtonDlg();
      return false;
	}
	
	if (HasClockIn == "yes") {
//		if (CameFromEmpls == "yes") {
		if (whichGet == "Empls") {
          doalert(emplName + " is clocked out.\nAre you finished?", "Successfully Clocked Out", "2", "Finished", "Switching Jobs");
	    } else {
          doalert(emplName + " is clocked out.\nAre you going home?", "Successfully Clocked Out", "2", "Going Home", "Switching Jobs");
	    }		  
	} else {
 		showButtons();	//Show choices for Cust (maybe), Cont, and then Tasks
	}
  }
}

function getCusts() {
    $.when(custsAjax()).then(parseCusts);
}

function custsAjax() {
	var formData = {safety:token}; //Array 
	 
	return $.ajax({
	    url : path + "getcusts.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
            marker = JSON.stringify(data);
            if (marker.includes("[")) {
		        Custs = data;
	        } else {
		        Msg = data.trim();
	        }
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with custsAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseCusts() {
	  var Compname = "";
      var lnCounter = 0;
          $( "#cardswipe" ).hide("slow");
	      $( "#taskmessage" ).html("Clocking In " + emplName + "<br />Select company for Clock In:");
          var JSONCusts = JSON.parse(Custs);
          var JSONLength = JSONCusts.length;
          setupTaskTable(JSONLength);
			$.each(JSONCusts, function (index, value) {				
			  Compname = JSONCusts[index]['co_name'];
			  var text1 = "#button" + [lnCounter + 1];
			  var text2 = "Button" + [lnCounter + 1];
			  var text3 = "Save" + [lnCounter + 1];
		      $( text1 ).html(Compname);		    
			  $(text1).attr('name', text2);		      
		      $( text1 ).val(JSONCusts[index]['custno']);
		      lnCounter++;			  
			});        
          
          var lnRows = Math.round(lnCounter);	//&& Row count
          
          $( "#taskdiv" ).show("slow");
          
          whichGet = "Custs";
}

function getConts(pcValue) {
    $.when(contsAjax(pcValue)).then(parseConts);
}

function contsAjax(pcValue) {
	var formData;
	if (showcust == 1) { // Start with Custs
	  formData = {safety:token,custcode:pcValue}; //Array 
	} else {
	  formData = {safety:token}; //Array 
	}
    Msg = "";
	return $.ajax({
	    url : path + "getconts.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
            marker = JSON.stringify(data);
            if (marker.includes("[")) {
		        Conts = data;
	        } else {
		        Msg = data.trim();
	        }
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with contsAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseConts() {
      if (Msg.trim() != "") { 	
        doalert(Msg, "Problem");
        return false;
      }
	  var contcode = "";
	  var cntrct_name = "";
      var lnCounter = 0;

	  $( "#taskmessage" ).html("Clocking In " + emplName + "<br />Select contract for Clock In:");
      
      $( "#taskdiv" ).show("slow");
      
      var JSONConts = JSON.parse(Conts);
      var JSONLength = JSONConts.length;
      setupTaskTable(JSONLength);
      
		$.each(JSONConts, function (index, value) {				
		  var text1 = "#button" + [lnCounter + 1];
		  var text2 = "Button" + [lnCounter + 1];
		  var text3 = "Save" + [lnCounter + 1];
	      $( text1 ).html(JSONConts[index]['cntrct_nam']);		    
		  $(text1).attr('name', text2);		      
	      $( text1 ).val(JSONConts[index]['contcode']);
	      lnCounter++;			  
		});        

      whichGet = "Conts";
}

function getTasks(pcValue) {
    $.when(TasksAjax(pcValue)).then(parseTasks);
}

function TasksAjax(pcValue) {
	var formData = {safety:token,contcode:pcValue}; //Array 
    Msg = "";
	return $.ajax({
	    url : path + "gettasks.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
            marker = JSON.stringify(data);
            if (marker.includes("[")) {
		        Tasks = data;
	        } else {
		        Msg = data.trim();
	        }
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with TasksAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseTasks() {
      if (Msg.trim() != "") { 	
        doalert(Msg, "Problem");
        return false;
      }
	  var contcode = "";
	  var cntrct_name = "";
      var lnCounter = 0;
      
      $( "#taskmessage" ).html("Clocking In " + emplName + "<br />Select task for Clock In:");
      $( "#taskdiv" ).show("slow");
      var JSONTasks = JSON.parse(Tasks);
      var JSONLength = JSONTasks.length;
      setupTaskTable(JSONLength);
      
		$.each(JSONTasks, function (index, value) {				
		  var text1 = "#button" + [lnCounter + 1];
		  var text2 = "Button" + [lnCounter + 1];
		  var text3 = "Save" + [lnCounter + 1];
		  var newcomp = JSONTasks[index]['jobcode'] + "|" + JSONTasks[index]['task_desc']
		  var newdesc = JSONTasks[index]['task_desc']
		  var njobcode = JSONTasks[index]['jobcode']
	      $( text1 ).html(newdesc);		    
		  $(text1).attr('name', text2);		      
	      $( text1 ).val(newcomp);
	      lnCounter++;			  
		});        
		
      whichGet = "ClockIn";
}

function setupTaskTable(lnCount) {
   $("#tasktable tbody").empty();		        
	
   lnCount = Math.round(lnCount);
   if (lnCount % 2 === 0) {
	   llIsOdd = false;
	 } else {
	   llIsOdd = true;
   }
   	
  var TableRow = "";
  for (i = 1; i <= lnCount; i++) { 
	lcCounter = parseInt(i);
	
    if (i % 2 === 0) { /* we are even */ 
    } else { /* we are odd */ 
      TableRow = "tasktablerow" + lcCounter ;
 	  $("#tasktable").append('<tr id="' + TableRow + '">');
    }  
	$("#" + TableRow).append("<td><button type='button' id='button" + lcCounter + "' name='button" + lcCounter + "' value='' name='' onClick='showvalue(this)'></button></td>");
 	  
    if (i % 2 === 0) { /* we are even */ 
 	  $("#" + TableRow).append("</tr>");
    }  
  }
  
  if (llIsOdd) {
 	  $("#" + TableRow).append("<td></td></tr>");
  }
  
  $("#tasktable").append('<tr id="cancelrow"><td colspan="2" id="cancelcell"> ' +
	 '<button type="button" id="cancel1" value="cancel" name="cancel" class="cancel" ' + 
	 'onClick="return doclear()">Cancel</button></td></tr>');
}

function setupLetterTable() {
	var lnCount = 26;
	var letters = " AJSBKTCLUDMVENWFOXGPYHQZIR";
	var lcLetter = "";
	var addRow = true;
	
   $("#lettertable tbody").empty();		        
	
   lnCount = Math.round(lnCount);
   if (lnCount % 3 === 0) {
	   llIsOdd = false;
	 } else {
	   llIsOdd = true;
   }
   	
  var TableRow = "";
  for (i = 1; i <= lnCount; i++) { 
	lcCounter = parseInt(i);
	
    if (addRow) { /* we are even */ 
      TableRow = "lettertablerow" + lcCounter ;
 	  $("#lettertable").append('<tr id="' + TableRow + '">');
 	  addRow = false;
    }  
    lcLetter = letters.substr(i, 1);
	$("#" + TableRow).append("<td><button type='button' id='" + lcLetter + "' name='button" + lcLetter + "' value='" + lcLetter + "' name='' onClick='showvalue(this)'>" + lcLetter + "</button></td>");
 	  
    if (i % 3 === 0) { /* we are even */ 
 	  $("#" + TableRow).append("</tr>");
 	  addRow = true;
    }  
  }  
  
  $("#" + TableRow).append('<td id="cancelcell"> ' +
	 '<button type="button" id="cancel1" value="cancel" name="cancel" class="cancel" ' + 
	 'onClick="return doclear()">Cancel</button></td></tr>');	 
}

function doalert(pcValue, pcTitle, pcWhich, pcButton1, pcButton2, pcCallback) {
     if (!pcTitle) {
         pcTitle = 'Alert';
     }

     if (!pcWhich) {
         pcWhich = "1";
     }

     if (!pcCallback) {
         pcCallback = "";
     }

     if (!pcButton1) {
         pcButton1 = "Yes";
     }

     if (!pcButton2) {
         pcButton2 = "No";
     }

     if (!pcWhich) {
         pcWhich = "1";
     }

    if (!pcValue) {
        pcValue = 'No Message to Display.';
        return;
    } 
    
    if (pcWhich == "1") {
	    $("<div></div>").html(pcValue).dialog({
	        title: "Alert",
	        resizable: false,
	        modal: true,
	        title: pcTitle, 
	        buttons: {
	            "Ok": function() 
	            {
	                $( this ).dialog( "close" );
				    doclear();

	            }
	        }
	    });
	} else {
		 if (CameFromEmpls == "yes") {
			 $("<div></div>").html(pcValue).dialog({
					modal: true,
					resizable: true,
					width: 'auto', 
			        title: pcTitle, 
					buttons: [
					    {
					        text: pcButton1,
					        click: function () {
		                        $(this).dialog('close');
							    doclear();
							}
					    },
					    {
					        text: pcButton2,
					        click: function () {
						      showButtons();
		                      $(this).dialog('close');
					    	}
				    	}]
				});
		 } else {
			 $("<div></div>").html(pcValue).dialog({
					modal: true,
					resizable: true,
					width: 'auto', 
			        title: pcTitle, 
					buttons: [
					    {
					        text: pcButton1,
					        click: function () {
							    doalert("Have a good day, " + prfirst, "Goodbye!");
		                        $(this).dialog('close');
							    doclear();
							}
					    },
					    {
					        text: pcButton2,
					        click: function () {
						      showButtons();
		                      $(this).dialog('close');
					    	}
				    	}]
				});
		 }

			
    }	    
}

function clearButtons(lnCounter) {
	  for (i = lnCounter + 1; i <= 26; i++) { 
		  text1 = "#button" + [i];
		  text2 = "Button" + [i];
		  text3 = "Save" + [i];
          $( text1 ).val("");
          $( text1 ).html("");
          $( text1 ).hide();
      }
}          
          
function getEmplLetters() {
	CameFromEmpls = "yes";
    $.when(emplLettersAjax()).then(parseEmplLetters);
}

function emplLettersAjax() {
	var formData = {safety:token}; //Array 
	 
	return $.ajax({
	    url : path + "getempls.php?letters=yes",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
		    emplLetters = JSON.parse(data);				    
  		},
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with emplLettersAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseEmplLetters() {
	  var lcAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; //In this order to make 3-up buttons show Alpha vertically
	  var letter;
	  var text1;
	  var text2;
	  var emplCheck = 0;
	  var letterButton = "";

      $( "#buttondiv" ).hide("slow");
      
      setupLetterTable();
            
	  for (y = 0; y <= 25; y++) { 
		$letter = lcAlpha.substr(y, 1);
		$letterButton = "#" + $letter;
		emplCheck = emplLetters.indexOf($letter);
		
		if (emplCheck < 0){			
	      $( $letterButton ).prop( "disabled", true );
        } else {
	      $( $letterButton ).prop( "disabled", false );
	      $( $letterButton ).css("background","green");
        }
      }
           
      $( "#letterdiv" ).show("slow");

      whichGet = "Letters";
      
      return true;
}

function getEmpls(pcValue) {
    $.when(emplsAjax(pcValue)).then(parseEmpls);   
}

function emplsAjax(pcValue) {
	var formData = {safety:token, 
					letter:pcValue}; //Array 	 
	return $.ajax({
	    url : path + "getempls.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
		    emplList = data;				    
  		},
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with emplsAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseEmpls() {
      if (Msg.trim() != "") { 	
        doalert(Msg, "Problem");
        return false;
      }
      $( "#letterdiv" ).hide("slow");
      
      var lnCounter = 0;
	  for (x = 1; x <= 12; x++) { 
	    tablerow = "#tasktablerow" + [x];
        $( tablerow ).hide();
      }
      
	  clearButtons(0);
      
      $( "#taskmessage" ).html("Which employee do you want Clock In for?");
      $( "#taskdiv" ).show("slow");
      var JSONEmpls = JSON.parse(emplList);
      var JSONLength = JSONEmpls.length;
      setupTaskTable(JSONLength);
      
		$.each(JSONEmpls, function (index, value) {				
		  var text1 = "#button" + [lnCounter + 1];
		  var text2 = "Button" + [lnCounter + 1];
		  var text3 = "Save" + [lnCounter + 1];
		  prempl    = JSONEmpls[index]['prempl']
		  supeid    = JSONEmpls[index]['supeid']
		  prfirst = JSONEmpls[index]['prfirst']
		  prlast  = JSONEmpls[index]['prlast']
		  cardno  = JSONEmpls[index]['cardno']
		  emplName  = prlast + ", " + prfirst;
	      $( text1 ).show();
	      $( text1 ).html(emplName);
	      $( text1 ).val(cardno);
	      lnCounter++;			  
		});        
		
      whichGet = "Empls";
}

function showButtons(){
  if (showcust == 1) { // Start with Custs
	  getCusts();
      if (Msg.includes("[") || Msg.includes("Clocked")) {
      } else {	//Had problems with !
        if (Msg.length > 0) {
          doalert(Msg, "Problem");
          return false;
        }
      }		  
  } else {	// Start With Conts
	  ////////////////GetConts
	  getConts();
      if (Msg.includes("[")) {
      } else { //Had problems with !
        if (Msg.length > 0) {
          doalert(Msg, "Problem");
          return false;
        }
      }		  
  }	
}

function clockIn(pcValue) {
    $.when(clockInAjax(pcValue)).then(clockInReturn);
}

function clockInAjax(pcValue) {
    var lcTime = grabTime();
	
	var formData = {safety:token, 
	                jobcode2:pcValue,
	                prempl: prempl,
	                supeid: supeid,
	                timein: lcTime
	                }; //Array 
    Msg = "";
	return $.ajax({
	    url : path + "clockin.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
		    Msg = data.trim();
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with clockInAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function clockInReturn() {
	  if(Msg == "Clocked Out"){
	    //doalert (Msg, "Successfully Clocked Out");
		if (CameFromEmpls == "yes") {
          doalert(emplName + " is clocked out.\nAre you finished?", "Successfully Clocked Out", "2", "Finished", "Switching Jobs");
	    } else {
          doalert(emplName + " is clocked out.\nAre you going home?", "Successfully Clocked Out", "2", "Going Home", "Switching Jobs");
	    }		  
      } else {
	    if (Msg.includes("Failed.")) {
	      doalert(Msg, "Problem");
	    } else {
	      doalert (emplName + " is clocked in with Task: " + Msg, "Successfully Clocked In");
	    }
      }
}
///////////////////////////////////////////// END CLOCKIN FUNCTIONS /////////////////////////////////////////////////////////

///////////////////////////////////////////// MANAGER FUNCTIONS /////////////////////////////////////////////////////////
function showButtonDlg() {
       alertdlg.dialog('option', 'buttons', {
	        "Clock Employee": function() {
		       getEmplLetters();
		       alertdlg.dialog( "close" );
	        },
	        "End of Day": function() {
		       endDay();
	        },
	        "Reports": function() {
		       doMainReport();
	        },
	        "Settings": function() {
			   mainSettings("");
	        },
	        "Log Out": function() {
			   logOut();
	        },
	        "Return to Clock": function() {
		       alertdlg.dialog( "close" );
          	   $('input[name="cardinput"]').val("");    
               $( "#cardswipe" ).show("slow");
			   jumpCursor();          	   
	        }
        });
        
      alertdlg.dialog('option', 'height', 230);
      alertdlg.dialog('option', 'width', 900);
      $("#alertmessage").html("Which function do you wish to perform?");

      alertdlg.dialog( "open" );	      
}

function endDay() {		
   $( "#employeehide" ).hide();
    
   alertdlg.dialog('option', 'buttons', {
        "Submit": function() {
	       checkMagic();
	       return false;
        },
        Cancel: function() {
	      doclose();
        }
    }
    );
    
    alertdlg.dialog('option', 'height', 250);
    alertdlg.dialog('option', 'width', 350);
    
  $("#alertmessage").html("What is the magic password?");
  
  $("#alertform").append('<input type="password" name="password" id="password" value="magic" class="text ui-widget-content ui-corner-all">' +
  '<div id="employeemessage">Enter Employee Number: ' +
  '<input type="text" name="empnum" id="empnum" value="" class="text ui-widget-content ui-corner-all">' +
  '</div>');
  
   $("#empnum").focus();
//   alertdlg.dialog( "open" );	
}    

function checkMagic() {
  var lcPass = $("#password").val();
  if (lcPass == "") {
    $("#alertsavemessage").html("Empty Password!");
    return false;
  }
    
    getMagic(lcPass);
	return true;
}

function getMagic(pcValue) {
    $.when(magicAjax(pcValue)).then(parseMagic);
}

function magicAjax(pcValue) {
	var formData = {safety:token,magic:pcValue}; //Array 
	 
	return $.ajax({
	    url : path + "checkmagic.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
	        Msg = data.trim();
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with magicAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseMagic() {
    if (Msg == "Bad Password!") {
      $("#alertsavemessage").html("Bad Password!");
      $("#password").val("");
    } else {
	   doclose2();
       alertdlg.dialog('option', 'buttons', {
	        "Yes": function() {
		       checkUnmatched("1");
		       return false;
	        },
	        "No, Enter Cutoff": function() {
		       checkUnmatched("2");
		       return false;
	        },
	        Cancel: function() {
		      doclose();
	        }
	    }
	    );
	    
      $("#alertmessage").html("Should unmatched entries be cleared?");
		      
      alertdlg.dialog('option', 'height', 260);
      alertdlg.dialog('option', 'width', 500);
      alertdlg.dialog( "open" );	      
    }    
	return;
}

function checkUnmatched(pcValue) {
    doclose2();
	if (pcValue == "2") { //
       alertdlg.dialog('option', 'buttons', {
	        "Submit": function() {
		       checkCutoff();
		       return false;
	        },
	        Cancel: function() {
		      doclose();
	        }
	    }
	    );
      
      alertdlg.dialog('option', 'height', 250);
      alertdlg.dialog('option', 'width', 350);
      alertdlg.dialog( "open" );
      
	  $("#alertmessage").html("Please Enter Cutoff Time:");
	  $("#alertform").append('<input type="text" name="cutoff" id="cutoff" value="" class="text ui-widget-content ui-corner-all">');
  
	} else {
	  getTimes("");
	}
	return false;
}

function checkCutoff() {
    var lcTime = $("#cutoff").val();
    var result = false, m;
    var re = /^\s*([01]?\d|2[0-3]):?([0-5]\d)\s*$/;
    if ((m = lcTime.match(re))) {
        result = (m[1].length === 2 ? "" : "0") + m[1] + ":" + m[2];
    }
    if (!result) {
	  $("#alertsavemessage").html("Bad Time!");
      return false;
    }
    getTimes(lcTime);
	return false;
}

function getTimes(pcValue) {
    $.when(timesAjax(pcValue)).then(parseTimes);
}

function timesAjax(pcValue) {
	var formData = {safety:token,time:pcValue}; //Array 
	 
	return $.ajax({
	    url : path + "checktimes.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
	        var LocalMsg = data.trim();
		    var lcSplit = LocalMsg.split("|");
		    callbackData = lcSplit[1];
		    Msg = lcSplit[0];
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with magicAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseTimes() {
    doclose2();
	switch (Msg) {
		case "No Records!":
	      $("#alertsavemessage").html(Msg);
		  break;
		  
		case "Bad Records!":		  
	      alertdlg.dialog('option', 'buttons', {
	        "View Report": function() {		        
		       getErrorReport("");
	        },
	        "Export": function() {
		       getExport("");
		       return false;
	        },
	        Cancel: function() {
		      doclose();
	        }
		  }
		  );
	      $("#alertsavemessage").html("Errors were found on this proposed export.");

	      alertdlg.dialog('option', 'height', 200);
	      alertdlg.dialog('option', 'width', 500);
	      alertdlg.dialog( "open" );	
		  break;
		default:
		  doclose2();
	      alertdlg.dialog('option', 'buttons', {
	        "Export": function() {
		       getExport("");
		       return false;
	        },
	        Cancel: function() {
		      doclose();
	        }
		  }
		  );
      
	      $("#alertmessage").html("No errors found.  Ready to export?");
	      alertdlg.dialog('option', 'height', 200);
	      alertdlg.dialog('option', 'width', 500);
	      alertdlg.dialog( "open" );	
		  
		  break;		  
	}
	
	return;
}

function getErrorReport(pcValue) {
    $.when(errorreportAjax(pcValue)).then(parseErrorReport);
}

function errorreportAjax(pcValue) {
	var formData = {safety:token,select:callbackData}; //Array 
	 
	return $.ajax({
	    url : path + "doerrorreport.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
		    var lcSplit  = data.split("|");	    
		    reccount = lcSplit[0].replace('["', '');
		    jsonData = JSON.parse(data);
		    Msg = lcSplit[0];
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with errorreportAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseErrorReport() {
	doclose2();
	 $("#alerttable").append("<tr><th>Employee #</th><th>Name</th><th>Date</th><th>Time In</th><th>Time Out</th><th>Job Code</th></tr>");
	  var lnCount = parseInt(reccount);

	  for (i = 0; i <= lnCount; i++) { 
		  if (i == 0) {
			  continue;
		  }
		  
		  $("#alerttable").append("<tr><td>" + jsonData[i]["prempl"] + 
		                           "</td><td>" + jsonData[i]["prlast"] + "," + jsonData[i]['prfirst'] + 
		                           "</td><td>" + jsonData[i]["workdate"] + 
		                           "</td><td>" + jsonData[i]["timein"] + 
		                           "</td><td>" + jsonData[i]["TIMEOUT"] + 
		                           "</td><td>" + jsonData[i]["jobcode"] + 
		                           "</td></tr>");
		                           
      }
       alertdlg.dialog('option', 'buttons', {
	        "Export": function() {
		       getExport("");
	        },
	        Cancel: function() {
		      doclose();
	        }
	    }
	    );
      $("#alertmessage").html("Records with data problems");
      var lnCount2 = Math.min((lnCount * 85) + 150, 500);
  
      alertdlg.dialog('option', 'height', lnCount2);
      alertdlg.dialog('option', 'width', 800);
      alertdlg.dialog( "open" );	
      
	return;
}

function getExport(pcValue) {
    $.when(exportAjax(pcValue)).then(parseExport);
}

function exportAjax(pcValue) {
	var formData = {safety:token,select:callbackData}; //Array 
	 
	return $.ajax({
	    url : path + "doexport.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
	        var LocalMsg = data.trim();
		    var lcSplit = LocalMsg.split("|");
		    var callbackData = lcSplit[1];
		    Msg = lcSplit[0];
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with exportAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseExport() {
   doclose2();
   alertdlg.dialog('option', 'buttons', {
        Close: function() {
	      doclose();
        }
    }
    );
    $("#alertmessage").html(Msg);
    
	return;
}

function doMainReport() {
  $("#alertform").html("<form id='alertform'><table id='alerttable'></table></form>");
  $("#alertmessage").html("");
  $("#alertsavemessage").html("");
  $("#alerttable tbody").empty();	
   alertdlg.dialog('option', 'buttons', {
        "Clocked In Only": function() {
	       getReport("Clocked In", "");
        },
        "All Records": function() {
	       getReport("All Records", "");
        },
        "One Person": function() {
	       getOneReport("One Person", "");
        },
        Cancel: function() {
	      doclose();
        }			        
    }
    );		      
  $("#alertmessage").html("Which report do you wish to see?");
  alertdlg.dialog('option', 'height', 250);
  alertdlg.dialog('option', 'width', 800);  
}

function getOneReport(pcValue, pcValue2) {
     doclose2();
     alertdlg.dialog('option', 'buttons', {
	        "View Report": function() {		        
		       getReport("One Person");
	        },
	        Cancel: function() {
		      doMainReport();
	        }
	    }
	    );

    alertdlg.dialog('option', 'height', 250);
    alertdlg.dialog('option', 'width', 500);
    
    $("#alertmessage").html("");
  
    $("#alertform").append('<div id="employeemessage">Enter Employee Number: ' +
    '<input type="text" name="empnum" id="empnum" value="" class="text ui-widget-content ui-corner-all">' +
    '</div>');
	          
    $("#employeemessage").show();
    $("#empnum").focus();
}

function getReport(pcValue, pcValue2) {
  if (pcValue == "One Person") {	  
    pcValue2 = $("#empnum").val();
    if (pcValue2 == "") {
      $("#alertsavemessage").html("Empty Employee Number!");
      return false;
    }       
  }
    $.when(reportAjax(pcValue, pcValue2)).then(parseReport);
}

function reportAjax(pcValue,pcValue2) {
	var formData = {safety:token,select:pcValue,emplno:pcValue2}; //Array 
	 
	return $.ajax({
	    url : path + "doreport.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
		    var lcSplit  = data.split("|");	   
		    if (lcSplit[0] == "No Records!") {
			    reccount = lcSplit[0];
			    Msg = pcValue;
		    }  else {
		        Msg = lcSplit[0].replace('["', '');
		        lcSplit[2] = lcSplit[2].replace('",{', '[{');
			    reccount = lcSplit[1];
			    jsonData = JSON.parse(lcSplit[2]);
	        }
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with reportAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseReport() {
	var smallDate = "";
	if (reccount == "No Records!") {
      $("#alertsavemessage").html(reccount);
      return false;
	}
	
      $("#alertform").html("<form id='alertform'><table id='alerttable'></table></form>");
      $("#alertmessage").html(Msg);
	  $("#alerttable").append("<tr><th>Name</th><th>Employee #</th><th>Time In</th><th>Time Out</th><th>Clock In Date</th><th>Job Code</th><th>Description</th></tr>");
	  
	  var lnCount = parseInt(reccount);
      var lnCount2 = Math.min((lnCount * 95) + 150, 500);
      alertdlg.dialog('option', 'height', lnCount2);
      alertdlg.dialog('option', 'width', 1000);

	  for (i = 0; i <= lnCount; i++) { 	
		  smallDate = jsonData[i]["adddate"];
		  $("#alerttable").append("<tr><td>" + jsonData[i]["prlast"] + "," + jsonData[i]['prfirst'] + 
		                           "</td><td>" + jsonData[i]["prempl"] + 
		                           "</td><td>" + jsonData[i]["timein"] + 
		                           "</td><td>" + jsonData[i]["TIMEOUT"] + 
		                           "</td><td>" + smallDate.substr(0,10) + 
		                           "</td><td>" + jsonData[i]["jobcode"] + 
		                           "</td><td>" + jsonData[i]["task_desc"] + 
		                           "</td></tr>");
      }
      
	return;
}

function mainSettings(pcValue) {
   doclose2();
   alertdlg.dialog('option', 'buttons', {
        "Edit Employee Card IDs": function() {
	       getSetting("Edit Employee Card IDs", "");
        },
        "Rounding": function() {
	       getSetting("Rounding", "");
        },
        "Program Options": function() {
		   getSetting("Program Options");
        },
        Cancel: function() {
	      doclose();
        }
    }
    );
  
  alertdlg.dialog('option', 'height', 200);
  alertdlg.dialog('option', 'width', 800);
  alertdlg.dialog( "open" );	
  $("#alertmessage").html("What function to you want to perform?");
}

function getSetting(pcValue) {
   switch(pcValue) {
		case "Edit Employee Card IDs":
		  Msg = "";
		  getCards();		
		  break;
		
		case "Rounding":
	      alertdlg.dialog('option', 'buttons', {
			        "Save": function() {
				       var pcValue2 = $("#breakpoint").val();

				       var llBreakpoint = checkBreakpoint(pcValue2);
				       if (llBreakpoint) {
				         saveSettings();
				       }
				       return false;
			        },
			        Cancel: function() {
				      mainSettings();
			        }
		  }
		  );
	      
	 	  $("#alerttable").append('<tr><td>Round To Minutes:</td><td>' + 
		  '<input type="radio" name="timeslice" id="timeslice1" value="1">1 ' +
		  '<input type="radio" name="timeslice" id="timeslice5" value="5">5 ' +
		  '<input type="radio" name="timeslice" id="timeslice10" value="10">10 ' +
		  '<input type="radio" name="timeslice" id="timeslice15" value="15">15 ' +
		  '</td></tr> ' +
	      '<tr><td>When to Round Up?</td><td><input type="text" size="2" maxlength="2" id="breakpoint" name="breakpoint" onBlur="return checkBreakpoint(this.value)"></td></tr> ');
	      
		  var tsid = "#timeslice" + timeslice;
		  $(tsid).prop('checked', true);
		  $( "#breakpoint" ).val(breakpoint);
		  
          $("#alertmessage").html("Setup Options");
	      alertdlg.dialog('option', 'height', 350);
	      alertdlg.dialog('option', 'width', 500);
		  
		  break;
		
		case "Program Options":
	      alertdlg.dialog('option', 'buttons', {
			        "Save": function() {
				       var pcValue2 = $("#setupName").val();
				       var pcValue3 = $("#setupPass").val();
				       
				       var llOkay;
				       
				       if (pcValue2 != "") {
				         llOkay = okayPassword(pcValue2);
				       } else {
					     llOkay = true;
				       }

				       if (llOkay) {
				         saveOptions();
			           }
				       return false;
			        },
			        Cancel: function() {
				      mainSettings();
			        }
		  }
		  );
		  
	 	  $("#alerttable").append('<table id="optionstable" border="0"> ' +
    		'<tr id="setupPassRow"><td class="setupCell1">Existing password:<br />(only if you want to change export password)</td> ' +
    		'<td class="setupCell2"><input type="password" id="setupPass" name="setupPass" onBlur="return checkPassword(this.value)"></td></tr> ' +
    		'<tr id="setupNameRow"><td class="setupCell1">What do you want to use for an export password?</td> ' +
    		'<td class="setupCell2"><input type="password" id="setupName" name="setupName" value="" onBlur="return okayPassword(this.value)"></td></tr> ' +
    		'<tr><td class="setupCell1">Source of Card ID:</td><td class="setupCell2"> ' +
	  		'<input type="radio" name="cardsource" id="cardsource1" value="1">Employee #<br /> ' +
	  		'<input type="radio" name="cardsource" id="cardsource2" value="2">Text 3 field<br /> ' +
	  		'<input type="radio" name="cardsource" id="cardsource3" value="3">Manually Entered </td></tr> ' +
    		'<tr><td class="setupCell1">Ask for Customer before Contract?</td><td class="setupCell2"> ' +
			'<input type="checkbox" name="showcust" id="showcust" value=""></td></tr> ');
	      
          $("#alertmessage").html("Setup Options");
	      alertdlg.dialog('option', 'height', 500);
	      alertdlg.dialog('option', 'width', 600);
		
		  var cardchecked = "#cardsource" + cardsource;
		  $(cardchecked).prop('checked', true);
			  
		  if (showcust == "1") {
			$("#showcust").prop("checked", true);		  
		  }		  
		  
		break;
	
   }
}

function saveSettings(pcValue) {
    $.when(saveSettingsAjax(pcValue)).then(parseSaveSettings);
}

function saveSettingsAjax(pcValue) {
	var BP = $( "#breakpoint" ).val();
	var TS = $("input:radio[name='timeslice']:checked").val();
	var formData = {safety:token,timeslice:TS,breakpoint:BP}; //Array 
	 
	return $.ajax({
	    url : path + "savesettings.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
	        Msg = data.trim();
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with saveSettingsAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseSaveSettings() {
    $("#alertsavemessage").html(Msg);
	var formData2 = {safety:token}; //Array 
	$.ajax({
	    url : path + "getsysdata.php",
	    type: "POST",
	    async: false,
	    data : formData2,
	    success: function(data, textStatus, jqXHR)
	    {
		    var grabJSON = JSON.parse(data);				    
	        var timesliceC = grabJSON[0]['TIMESLICE'];
	        var breakpointC = grabJSON[0]['BREAKPOINT'];
	        compno = grabJSON[0]['COMPNO'];
	        showcust = grabJSON[0]['SHOWCUST'];
	        setupName = grabJSON[0]['SETUPNAME'];
	        cardsource = grabJSON[0]['cardsource'];
	        token = grabJSON[0]['token'];
            timeslice = parseInt(timesliceC);
            breakpoint = parseInt(breakpointC);
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with parseSaveSettings call: " + errorThrown, "Error");			 
	    }
	});			
	
	return;
}

function checkPassword(pcValue) {
	if (pcValue != "") {
      $.when(passwordAjax(pcValue)).then(parsePassword);
    } else {
      $("#alertsavemessage").html("");
    }
    return false;
}

function passwordAjax(pcValue) {
	var formData = {safety:token,magic:pcValue}; //Array 
	 
	return $.ajax({
	    url : path + "checkmagic.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
		   Msg = data;
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with passwordAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parsePassword(pcValue) {
  if (Msg.trim() == "Bad Password!") { 	
    $("#alertsavemessage").html(Msg);
    if ( $('#setupPass').length ) {
      $("#setupPass").val("");
    }
    return false;    
  } else {
      $( "#setupNameRow" ).show("slow");
      $( "#setupNameRow" ).focus();
      $("#setupPass").val("");
  }
  return false;
}

function saveOptions(pcValue) {
    $.when(optionsAjax(pcValue)).then(parseOptions);
}

function optionsAjax(pcValue) {
  if ($('#showcust').is(":checked"))	{
	showcust = '1';
  } else {
	showcust = '0';
  }
  
  cardsource = $('input[name=cardsource]:checked').val();  	
  setupName = $("#setupName").val();
  $( "#setupName" ).val("");
  $( "#setupNameRow" ).hide("slow");
  
  var formData = {safety:token,setupName:setupName,cardsource:cardsource,showcust:showcust}; //Array 

	return $.ajax({
	    url : path + "saveoptions.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
	        Msg = data.trim();
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with optionsAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseOptions() {
    $("#alertsavemessage").html(Msg);
    $("#alertsavemessage").show();    
	return;
}

function getCards() {
    $.when(cardsAjax()).then(parseCards);    
}

function cardsAjax(pcValue) {
	var formData = {safety:token}; //Array 	 
	
	return $.ajax({
	    url : path + "getcards.php",
	    type: "POST",
	    async: false,
	    data : formData,
	    success: function(data, textStatus, jqXHR)
	    {
		    var lcSplit  = data.split("|");	    
		    reccount = lcSplit[0].replace('["', '');
		    cardList = '[' + lcSplit[1].substring(2);
  		},
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with cardsAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseCards() {
   alertdlg.dialog('option', 'buttons', {
        "Save": function() {		        
	       saveCards();
        },
        Cancel: function() {
	      mainSettings();
        },
        "Add Manager": function() {
	       addCard();
	       return false;
        }
    }
    );
  
  alertdlg.dialog('option', 'height', 500);
  alertdlg.dialog('option', 'width', 700);
	
  $("#alertmessage").html("Edit Card Numbers");
  $("#alerttable tbody").empty();		        
    
  jsonData = JSON.parse(cardList);
  
   $("#alerttable").append("<tr><th>Card #</th><th>Emp. #</th><th>First Name</th><th>Last Name</th><th>Manager?</th></tr>");
   
  var lnCount = parseInt(reccount);
  var lcCardno, lcEmplno, lcFirst, lcLast, lcIsMgr, lcChecked, lcDisabled = "";
  
  for (i = 0; i < lnCount; i++) { 
	  if (jsonData[i]["ismgr"] == "1") {
	    lcChecked = "checked";
	    lcDisabled = "";
	  } else {
	    lcChecked = "";
	    lcDisabled = "disabled";
	  }
	  
	  lcCounter = parseInt(i + 1);
	  
	  lcCardno = "<tr><td><input type='text' id='cardno-" + lcCounter + "' name='cardno-" + lcCounter + "' value='" + jsonData[i]["cardno"] + "' maxlength='9' size='10'></td>";
	  lcEmplno = "<td><input type='text' id='prempl-" + lcCounter + "' name='prempl-" + lcCounter + "' value='" + jsonData[i]["prempl"] + "' size='10' disabled></td>";
	  lcFirst  = "<td><input type='text' id='prfirst-" + lcCounter + "' name='prfirst-" + lcCounter + "' value='" + jsonData[i]["prfirst"] + "' maxlength='15' size='16' " + lcDisabled + "></td>";
	  lcLast   = "<td><input type='text' id='prlast-" + lcCounter + "' name='prlast-" + lcCounter + "' value='" + jsonData[i]["prlast"] + "' maxlength='25' size='26' " + lcDisabled + "></td>";
      lcIsMgr  = "<td><input type='checkbox' name='ismgr-" + lcCounter + "' id='ismgr-" + lcCounter + "' value='yes' " + lcChecked + " onChange='return checkCard(this)'>";
      lcID   = "<input type='hidden' name='id-" + lcCounter + "' id='id-" + lcCounter + "' value='" + + jsonData[i]["id"] + "'></td></tr>";
      
	  $("#alerttable").append(lcCardno + lcEmplno + lcFirst + lcLast + lcIsMgr + lcID);
  }      
}

function checkCard(pcValue2) {
  var lnDash = pcValue2.id.indexOf("-");
  var lcNum = pcValue2.id.substr(lnDash + 1);
  var lcPrfirst = "#prfirst-" + lcNum;
  var lcPrlast  = "#prlast-" + lcNum;
  if (pcValue2.checked) {
	$(lcPrlast).removeAttr('disabled');
	$(lcPrfirst).removeAttr('disabled');
  } else {
	$(lcPrfirst).attr('disabled', '');			  
	$(lcPrlast).attr('disabled', '');			  
  }

  return false;
}

function addCard() {
  var lcCounter = $('table#alerttable tr:last').index() + 1;
  reccount = reccount + 1;  
  reccount = lcCounter;
	
  lcCardno = "<tr><td><input type='text' id='cardno-" + lcCounter + "' name='cardno-" + lcCounter + "' value='' maxlength='9' size='10'></td>";
  lcEmplno = "<td><input type='text' id='prempl-" + lcCounter + "' name='prempl-" + lcCounter + "' value='' size='10' disabled></td>";
  lcFirst  = "<td><input type='text' id='prfirst-" + lcCounter + "' name='prfirst-" + lcCounter + "' value='' maxlength='15' size='16'></td>";
  lcLast   = "<td><input type='text' id='prlast-" + lcCounter + "' name='prlast-" + lcCounter + "' value='' maxlength='25' size='26'></td>";
  lcIsMgr  = "<td><input type='checkbox' name='ismgr-" + lcCounter + "' id='ismgr-" + lcCounter + "' value='yes' checked disabled >";
  lcID   = "<input type='hidden' name='id-" + lcCounter + "' id='id-" + lcCounter + "' value='0'></td></tr>";
  
  $(lcCardno + lcEmplno + lcFirst + lcLast + lcIsMgr + lcID).insertAfter("#alerttable tr:first");  
}

function saveCards() {
	  var lnCount = parseInt(reccount);
	  var lcCardno, lcCardVal, lcFirstName, lcLastName, lcFirst, lcLast, lcIsMgr, lcChecked, lcDisabled = "";
	  
	  var lnCount = parseInt(reccount);
	  var CardArray = [];
	  
// First we check for blank Card #s	  
	  for (i = 1; i <= lnCount; i++) { 
        lcCardno = "#cardno-" + i.toString();
        lcCardVal = $(lcCardno).val();
        CardArray[i] = lcCardVal;
        
		if (lcCardVal == "") {
	      $("#alertsavemessage").html("Blanks not allowed in Card Numbers!");
	      return false;
		}		
    }
    
// Next we check for duplicates   
    var OldLength = CardArray.length;    
    var UniqueArray = jQuery.unique( CardArray );
    if (UniqueArray.length != OldLength) {
      $("#alertsavemessage").html("Duplicate Card Numbers!");
      return false;
    }
    
// Next we check for blank names when Manager
	  for (i = 1; i <= lnCount; i++) { 
        lcIsMgr = "#ismgr-" + i.toString();
        lcChecked = $(lcIsMgr).is(':checked');
        if (!lcChecked) {
	        continue;
        }

        lcFirstName = "#prfirst-" + i.toString();
        lcFirst = $(lcFirstName).val();
        if (lcFirst == undefined) {
	        lcFirst = "";
        }
        
        lcLastName = "#prlast-" + i.toString();
        lcLast = $(lcLastName).val();
        
        if (lcLast == undefined) {
	        lcLast = "";
        }
        
		if (lcFirst == "" || lcLast == "") {
	      $("#alertsavemessage").html("Blanks not allowed in name fields for managers!");
	      return false;
		}		
    }
    
//Passed the tests!  On to sending data to the server    
    $.when(saveCardsAjax()).then(parseSaveCards);
}

function saveCardsAjax() {
	var formData = $("#alertform").serialize();
	formData = formData.replace("+", " ");
//	alert("F:" + formData);
	
	var sendData = {safety:token,count:reccount,form:formData}; //Array 
	
	return $.ajax({
	    url : path + "savecards.php",
	    type: "POST",
	    async: false,
	    data : sendData,
	    success: function(data, textStatus, jqXHR)
	    {
	        Msg = data.trim();
	    },
	    error: function (jqXHR, textStatus, errorThrown)
	    {
	        doalert("Connection Error with saveCardsAjax call: " + errorThrown, "Error");			 
	    }
	});	
}

function parseSaveCards() {
  $("#alertsavemessage").html(Msg);	
	getCards();		
}
///////////////////////////////////////////// END MANAGER FUNCTIONS /////////////////////////////////////////////////////////

///////////////////////////////////////////// UTILITY FUNCTIONS /////////////////////////////////////////////////////////
function showvalue(pcValue) {
	switch (whichGet) {
		case "Custs":
	      getConts(pcValue.value);
		  break;
		  
		case "Conts":
	      getTasks(pcValue.value);
		  break;
		  
		case "ClockIn":
		  if(pcValue.value == "Clocked Out"){
			HasClockIn = "yes";
	        showData(pcValue.value);
	      } else {
	        clockIn(pcValue.value);
	      }
		  break;
		  
		case "Letters":
	      getEmpls(pcValue.value);
		  break;
		  
		case "Empls":
	      checkClockno(pcValue.value);
		  break;
		  
		  
	}
	
    return false;
}

function doclose() {
  $("#alertform").html("");
  $("#alertmessage").html("");
  $("#alertsavemessage").html("");
  $("#alerttable tbody").empty();	
  $( "#taskdiv" ).hide();
  $( "#letterdiv" ).hide();
  	        
  showButtonDlg();	
}

function doclose2() {
  $("#alertform").html("<form id='alertform'><table id='alerttable'></table></form>");
  $("#alertmessage").html("");
  $("#alertsavemessage").html("");
  $("#alerttable tbody").empty();		        
}

function doclear() {
  emplName = "";
  prempl = "";
  prfirst = "";
  prlast = "";
  supeid = "";
  Msg = "";
  Custs = "";
  Conts = "";
  Tasks = "";
  whichGet = "";
  if (CameFromEmpls == "yes") {
	  $( "#taskdiv" ).hide();  
	  $( "#letterdiv" ).hide();  
	  doclose();
  } else {
	  $('input[name="cardinput"]').val("");    
	  $( "#cardswipe" ).show("slow");
	  $( "#taskdiv" ).hide();  
	  $( "#letterdiv" ).hide();  
	  $( "#alertdiv" ).hide();  
      jumpCursor();
  }

  return;
}

function checkNumeric(pcValue) {	
    var pcValue2 = $.isNumeric(pcValue);
    
    if (!pcValue2) {
	  var pcValue3 = pcValue.substring(0, pcValue.length - 1);
      $("#breakpoint").val(pcValue3);
      return false;
    }
    return true;	
}

function checkBreakpoint(pcValue) {
    var pcValue2 = $.isNumeric(pcValue);
    
    if (!pcValue2) {
      $("#alertsavemessage").html("Value must be an integer.");
      return false;
    } else {
	    timeslice = $("input:radio[name='timeslice']:checked").val();
	    
	    if (parseInt(pcValue) >= parseInt(timeslice) || parseInt(pcValue) < 0 ) {
		  if (parseInt(pcValue) < 0) {
	        $("#alertsavemessage").html("Value must be greater than zero.");
		  } else {
	        $("#alertsavemessage").html("Value must be less than Round To value.");
		  }
	      return false;
        }
	  }
      $("#alertsavemessage").html("");
      return true;
}

function okayPassword(pcValue) {
	if (pcValue == "") { // No blank new passwords allowed
      $("#alertsavemessage").html("New password blank!");
      return false;
    }
    
	if (pcValue.length < 5) { // No new passwords less than 5 in length
      $("#alertsavemessage").html("New password less than 5 in length!");
      return false;
    }
    
    return true;
}

function doinclude() {
	$(function() {
	    button = $( "#button-form" ).dialog({
	      autoOpen: false,
	      height: 200,
	      width: 800,
	      modal: true,
	      buttons: {
	        "Clock Employee": function() {
		       getEmplLetters();
		       button.dialog( "close" );
	        },
	        "End of Day": function() {
		       endDay();
		       button.dialog( "close" );
	        },
	        "Reports": function() {
		       button.dialog( "close" );
		       reportchoice.dialog( "open" );
               $("#reportchoicemessage").show();
	        },
	        "Settings": function() {
			   mainSettings("");
		       button.dialog( "close" );
	        },
	        "Return to Clock": function() {
		       button.dialog( "close" );
          	   $('input[name="cardinput"]').val("");    
               $( "#cardswipe" ).show("slow");
			   jumpCursor();          	   
	        }
	      },
	    });		 
		
	    alertdlg = $( "#alertdiv" ).dialog({
	      autoOpen: false,
	      height: 220,
	      width: 500,
	      modal: true,
	      buttons: {
	        Cancel: function() {
		      doclose();
	        }
	      },
	    });		 
	  } );				  
}
///////////////////////////////////////////// END UTILITY FUNCTIONS /////////////////////////////////////////////////////////

