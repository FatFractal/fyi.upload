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
        ff.setBaseUrl("http://localhost:8080/upload");
        ff.setSimulateCookies(true);
        ff.login("derp", "dederp", function(user) {
            console.log("logged in as " + user.guid);
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
                if (imagedata) newNote.picture = base64DecToArr(imagedata).buffer;

                ff.createObjAtUri(newNote, "/Note", function(result) {
                    $.mobile.changePage("#home");
                }, function(error) {
                    console.log("Oh crap", error);
                });

                cleanUp();
            });

            $("#takePicBtn").on("click", function(e) {
                e.preventDefault();
                navigator.camera.getPicture(gotPic, failHandler, 
                    {quality:50, destinationType:Camera.DestinationType.DATA_URL,
                     sourceType:Camera.PictureSourceType.PHOTOLIBRARY});
            });
            
            function gotPic(data) {
                console.log('got here');
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


            /*
                Following functions from

                https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
                
                All this to convert base64 -> ArrayBuffer, ay ay ay ...
            */
            function b64ToUint6(nChr) {
                return nChr > 64 && nChr < 91 ?
                       nChr - 65
                     : nChr > 96 && nChr < 123 ?
                       nChr - 71
                     : nChr > 47 && nChr < 58 ?
                       nChr + 4
                     : nChr === 43 ?
                       62
                     : nChr === 47 ?
                       63
                     :
                       0;
            }

            function base64DecToArr(sBase64, nBlocksSize) {
                var
                    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
                    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);

                for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
                    nMod4 = nInIdx & 3;
                    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
                    if (nMod4 === 3 || nInLen - nInIdx === 1) {
                        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                            taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                        }
                        nUint24 = 0;
                    }
                }

                return taBytes;
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
