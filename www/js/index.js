var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {

        $(function(){
            $("#div-ajax-loading").hide();
        });

        nfc.addNdefListener(
            app.onNdef,
            function() {},
            function() {alert(app.errors.nfc_addNdefListener);}
        );

        if (device.platform == "Android") {

            nfc.addTagDiscoveredListener(
                app.onNfc,
                function() {},
                function() {alert(app.errors.nfc_addTagDiscoveredListener);}
            );

            // Android launches the app when tags with mime type text/pg are scanned
            // because of an intent in AndroidManifest.xml.
            // phonegap-nfc fires an ndef-mime event (as opposed to an ndef event)
            // the code reuses the same onNfc handler
            nfc.addMimeTypeListener(
                'text/pg',
                app.onNdef,
                function() {},
                function() {alert(app.errors.nfc_addMimeTypeListener);}
            );

        }



        app.compileTemplates();
        app.addTemplateHelpers();

    },
    onNfc: function (nfcEvent) {

        var tag = nfcEvent.tag;

        app.getInfoByTagId(tag.id);
        app.clearScreen();

        tagContents.innerHTML = app.nonNdefTagTemplate(tag);
        navigator.notification.vibrate(100);


    },
    onNdef: function (nfcEvent) {

        var tag = nfcEvent.tag;

        // BB7 has different names, copy to Android names
        if (tag.serialNumber) {
            tag.id = tag.serialNumber;
            tag.isWritable = !tag.isLocked;
            tag.canMakeReadOnly = tag.isLockable;
        }

        navigator.notification.vibrate(100);
    },
    getInfoByTagId: function (tagId) {

        $(function(){

            var stringIdTag;
            var urlApiRest;

            stringIdTag = nfc.bytesToHexString(tagId);
            urlApiRest = 'http://api.nfc.mooo.com/demo/' + stringIdTag + '/chip';

            $("#div-ajax-loading").show();

            $.getJSON(urlApiRest,function(data){

                var string;

                if(empty(data)){
                    string = app.tagInfoDbEmptyTemplate({texto:app.errors.ajax_infoDB_empty});
                    $("#div-info-chip").show().html(string);
                }else{
                    string = app.tagInfoDbTemplate(data);
                    $("#div-info-chip").show().html(string);
                }

            }).done(function(){
                $("#div-ajax-loading").hide();
            }).fail(function(){
                $("#div-info-chip").show().text(app.errors.ajax_infoDB);
                $("#div-ajax-loading").hide();
            });


        });

    },
    compileTemplates: function () {

        var source;

        source = document.getElementById('non-ndef-template').innerHTML;
        app.nonNdefTagTemplate = Handlebars.compile(source);

        source = document.getElementById('tag-info-db-template').innerHTML;
        app.tagInfoDbTemplate = Handlebars.compile(source);

        source = document.getElementById('tag-info-db-empty-template').innerHTML;
        app.tagInfoDbEmptyTemplate = Handlebars.compile(source);

    },
    clearScreen: function () {

        tagContents.innerHTML = "";

    },
    addTemplateHelpers: function () {

        Handlebars.registerHelper('bytesToHexString', function(byteArray) {
            return nfc.bytesToHexString(byteArray);
        });

    },
    errors:{
        ajax_infoDB_empty:"Tag Desconocido",
        ajax_infoDB:"ERROR: No se pudo obtener la informacion de la base de datos.",
        nfc_addTagDiscoveredListener:"Error en [addTagDiscoveredListener]",
        nfc_addNdefListener:"Error en [addNdefListener]",
        nfc_addMimeTypeListener:"Error en [addMimeTypeListener]"
    }

};