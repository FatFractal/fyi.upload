fyi.upload
==========
A small PhoneGap app, inspired by [a recent blog post by Raymond Camden](http://www.raymondcamden.com/index.cfm/2013/7/23/Better-example-of-PhoneGap-Parse-and-uploading-files), intended to show how much easier [FatFractal](http://fatfractal.com) makes it to create an object containing a blob.

For the impatient, here's the money part. The relevant code for uploading with Parse:

	/*
	A bit complex - we have to handle an optional pic save
	*/
	if (imagedata != "") {
		var parseFile = new Parse.File("mypic.jpg", {base64:imagedata});
		console.log(parseFile);
			parseFile.save().then(function() {
				var note = new NoteOb();
				note.set("text",noteText);
				note.set("picture",parseFile);
				note.save(null, {
					success:function(ob) {
						$.mobile.changePage("#home");
					}, error:function(e) {
						console.log("Oh crap", e);
					}
				});
				cleanUp();
			}, function(error) {
				console.log("Error");
				console.log(error);
			});
 
	} else {
		var note = new NoteOb();
		note.set("text",noteText);
		note.save(null, {
			success:function(ob) {
				$.mobile.changePage("#home");
			}, error:function(e) {
				console.log("Oh crap", e);
			}
		});
		cleanUp();
 	}

Here's the FatFractal code:

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

The only other significant change was to switch to reading the image from the filesystem rather than receive it as a base64-encoded string, which is better practice anyway.