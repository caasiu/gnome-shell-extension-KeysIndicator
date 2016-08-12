
const St = imports.gi.St;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Atk = imports.gi.Atk;

//detect the keyboard key press event
const Gdk = imports.gi.Gdk;
const Keymap = Gdk.Keymap.get_default();

//const ExtensionUtils = imports.misc.extensionUtils;
//const Me = ExtensionUtils.getCurrentExtension();
//const Convenience = Me.imports.convenience;

const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain('keys-indicator');
const _ = Gettext.gettext;

let keysIndicator;


const KeysIndicator = new Lang.Class({
    Name: 'KeysIndicator',
    Extends: PanelMenu.Button,

    _init: function(){
        this.parent(0.0, _("KeysIndicator"), true);

        //define 5 label to show the keys status later
        this.capsLock = new St.Label({ style_class: "label-style",
                                       y_align: Clutter.ActorAlign.CENTER,
                                       visible: false,
                                       text: _("A") });

        this.numLock = new St.Label({ style_class: "label-style",
                                      y_align: Clutter.ActorAlign.CENTER,
                                      visible: false,
                                      text: _("1") });

        this.keyCtrl = new St.Label({ style_class: "label-style",
                                      y_align: Clutter.ActorAlign.CENTER,
                                      visible: false,
                                      text: _("Ctrl") });
        
        this.keyShift = new St.Label({ style_class: "label-style",
                                      y_align: Clutter.ActorAlign.CENTER,
                                      visible: false,
                                      text: _("Shift") });

        this.keyAlt = new St.Label({ style_class: "label-style",
                                     y_align: Clutter.ActorAlign.CENTER,
                                     visible: false,
                                     text: _("Alt") });

        //put all the label together
        this.layoutManager = new St.BoxLayout({style_class: 'box-style'});
        //Todo: add 5 label using one line?
        this.layoutManager.add(this.capsLock);
        this.layoutManager.add(this.numLock);
        this.layoutManager.add(this.keyCtrl);
        this.layoutManager.add(this.keyShift);
        this.layoutManager.add(this.keyAlt);

        //add the box to the panel 
        this.actor.add_actor(this.layoutManager);
        this.actor.visible = false;
    },

    setActive: function(enable){
        if (enable){
            this.actor.visible = true;
            this._KeyStatusId = Keymap.connect('state_changed', Lang.bind(this, this._updateStatus));
        } else {
            this.actor.visible = false;
            Keymap.disconnect(this._KeyStatusId);
        }
    },

    _updateStatus: function(){
        let capStatus = Keymap.get_caps_lock_state();
        let numStatus = Keymap.get_num_lock_state();

        //get_modifier_state will return a num refer to the key
        //CapsLock is 2; NumLock is 16; Shift is 1; Ctrl is 4; Alt is 8
        //every time we press these keys will be the numbers add
        //example <Ctrl>+<Shift> is 5
        let multiKeysCode = Keymap.get_modifier_state();

        if (capStatus){
            this.capsLock.visible = true;
            multiKeysCode = multiKeysCode - 2;
        } else {
            this.capsLock.visible = false;
        }

        if (numStatus){
            this.numLock.visible = true;
            multiKeysCode = multiKeysCode - 16;
        } else {
            this.numLock.visible = false;
        }

        switch(multiKeysCode){
            case 1:
                this.keyAlt.visible = false;
                this.keyCtrl.visible = false;
                this.keyShift.visible = true;
                break;
            case 4:
                this.keyAlt.visible = false;
                this.keyCtrl.visible = true;
                this.keyShift.visible = false;
                break;
            case 8:
                this.keyAlt.visible = true;
                this.keyCtrl.visible = false;
                this.keyShift.visible = false;
                break;
            case 5:
                this.keyAlt.visible = false;
                this.keyCtrl.visible = true;
                this.keyShift.visible = true;
                break;
            case 9:
                this.keyAlt.visible = true;
                this.keyCtrl.visible = false;
                this.keyShift.visible = true;
                break;
            case 12:
                this.keyAlt.visible = true;
                this.keyCtrl.visible = true;
                this.keyShift.visible = false;
                break;
            case 13:
                this.keyAlt.visible = true;
                this.keyCtrl.visible = true;
                this.keyShift.visible = true;
                break;
            default:
                this.keyAlt.visible = false;
                this.keyCtrl.visible = false;
                this.keyShift.visible = false;
        }
    },

    destroy: function(){
        this.setActive(false);
        this.parent();
    },

});


function init(){

}


function enable(){

    keysIndicator = new KeysIndicator;
    keysIndicator.setActive(true);

    //the number '2' is for position
    //0 is left(default); 1 is middle; 2 is right;
    Main.panel.addToStatusArea('keysIndicator', keysIndicator, 2);
}


function disable(){
    keysIndicator.destroy();
}
