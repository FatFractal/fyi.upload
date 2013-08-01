/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();

        var ff = new FatFractal();
        ff.setBaseUrl("http://fyi.fatfractal.com/upload");
        ff.setSimulateCookies(true);
        ff.login("derp", "DeDerp123", function(user) {
            alert("logged in");
            console.log("logged in as " + user.guid);
        }, function(code, msg) {
            alert("error: " + msg);
        });

        $(document).on("pageshow", "#home", function(e, ui) {
            $.mobile.loading("show");
            ff.getArrayFromUri("/Note?sort=createdAt desc&start=0&count=10", function(results) {
                $.mobile.loading("hide");
                var s = "";
                for (var i = 0; i < results.length; i++) {
                    //Lame - should be using a template
                    s += "<p>";
                    s += "<h3>Note " + new Date(results[i].createdAt) + "</h3>";
                    s += results[i].text;
                    if (results[i].ffRefs) {
                        s += "<br/><img width='300px' src='" + ff.getBaseUrl() + results[i].ffUrl + "/picture" + "'>";
                    }
                    s += "</p>";
                }
                $("#home div[data-role=content]").html(s);
            }, function(error) {
                $.mobile.loading("hide");
            });
        })

        $(document).on("pageshow", "#addNote", function(e, ui) {
            var imagedata = null;

            $("#saveNoteBtn").on("touchend", function(e) {
                e.preventDefault();
                $(this).attr("disabled", "disabled");

                var noteText = $("#noteText").val();
                if (noteText == "") return;

                // Not even a little bit complex -- just set the member
                var newNote = {
                    clazz: "Note",
                    text: noteText
                };
                if (imagedata) newNote.picture = imagedata;

                ff.createObjAtUri(newNote, "/Note", function(result) {
                    $.mobile.changePage("#home");
                }, function(error) {
                    console.log("Oh crap", error);
                });

                cleanUp();
            });

            $("#takePicBtn").on("click", function(e) {
                e.preventDefault();
                navigator.camera.getPicture(gotPicFileUri, failHandler, 
                    {quality:50, destinationType:Camera.DestinationType.FILE_URI,
                     sourceType:Camera.PictureSourceType.PHOTOLIBRARY});
            });

            function gotPicFileUri(fileUri) {
                window.resolveLocalFileSystemURI(fileUri, gotPicFileEntry, failHandler);
            }

            function gotPicFileEntry(fileEntry) {
                fileEntry.file(gotPicFile, failHandler);
            }

            function gotPicFile(file) {
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    gotPic(evt.target.result);
                };
                reader.onerror = failHandler;
                reader.readAsArrayBuffer(file);
            }
            
            function gotPic(data) {
                imagedata = data;
                $("#takePicBtn").text("Picture Taken!").button("refresh");
            }
            
            function failHandler(e) {
                alert("ErrorFromC");
                alert(e);
                console.log(e.toString());
            }
            
            function cleanUp() {
                imagedata = null;
                $("#saveNoteBtn").removeAttr("disabled").button("refresh");
                $("#noteText").val("");
                $("#takePicBtn").text("Add Pic").button("refresh");
            }
        });
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
