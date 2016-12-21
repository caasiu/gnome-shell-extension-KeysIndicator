
const St = imports.gi.St;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Atk = imports.gi.Atk;

//detect the keyboard key press event
const Gdk = imports.gi.Gdk;
const Keymap = Gdk.Keymap.get_default();

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Gettext = imports.gettext.domain('keys-indicator');
const _ = Gettext.gettext;

let keysIndicator, sideId, indexId, styleId;
let setting = Convenience.getSettings();


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
        //this.capsLock.set_style('color: red; bindex: 1px solid red;');

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
            let styleName = setting.get_string('styles');

            if (styleName == 'popup'){
                //init
                this.actor.visible = false;

                this.keyAlt.visible = false;
                this.keyAlt.remove_style_class_name("grayout-style");

                this.keyCtrl.visible = false;
                this.keyCtrl.remove_style_class_name("grayout-style");

                this.keyShift.visible = false;
                this.keyShift.remove_style_class_name("grayout-style");

                this.capsLock.visible = false;
                this.capsLock.remove_style_class_name("grayout-style");

                this.numLock.visible = false;
                this.numLock.remove_style_class_name("grayout-style");

                this._KeyStatusId = Keymap.connect('state_changed', Lang.bind(this, this._popupStyle));
                //when extension was enabled, check whether numLock or capsLock is on
                this._popupStyle();

            }

            if (styleName == 'grayout'){
                this.actor.visible = true;
                this.keyAlt.visible = true;
                this.keyCtrl.visible = true;
                this.keyShift.visible = true;
                this.capsLock.visible = true;
                this.numLock.visible = true;

                this._KeyStatusId = Keymap.connect('state_changed', Lang.bind(this, this._grayoutStyle));
                this._grayoutStyle();
            }
        
        } else {
            this.actor.visible = false;
            Keymap.disconnect(this._KeyStatusId);
        }
    },

    _popupStyle: function(){
        let capStatus = Keymap.get_caps_lock_state();
        let numStatus = Keymap.get_num_lock_state();

        //get_modifier_state will return a num refer to the key
        //CapsLock is 2; NumLock is 16; Shift is 1; Ctrl is 4; Alt is 8
        //every time we press these keys will be the numbers add
        //example <Ctrl>+<Shift> is 5
        let multiKeysCode = Keymap.get_modifier_state();

        if (capStatus || numStatus || multiKeysCode){
            this.actor.visible = true;
        } else {
            this.actor.visible = false;
        }

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

        //key <Win> number is 64 
        if ((multiKeysCode >= 64)&&(multiKeysCode <= 77)){multiKeysCode = multiKeysCode - 64; }

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

    _grayoutStyle: function(){
        let capStatus = Keymap.get_caps_lock_state();
        let numStatus = Keymap.get_num_lock_state();
        let multiKeysCode = Keymap.get_modifier_state();

        if (capStatus){
            this.capsLock.remove_style_class_name("grayout-style");
            multiKeysCode = multiKeysCode - 2;
        } else {
            this.capsLock.add_style_class_name("grayout-style");
        }

        if (numStatus){
            this.numLock.remove_style_class_name("grayout-style");
            multiKeysCode = multiKeysCode - 16;
        } else {
            this.numLock.add_style_class_name("grayout-style");
        }

        //key <Win> number is 64 
        if ((multiKeysCode >= 64)&&(multiKeysCode <= 77)){multiKeysCode = multiKeysCode - 64; }

        switch(multiKeysCode){
            case 1:
                this.keyShift.remove_style_class_name("grayout-style");
                break;
            case 4:
                this.keyCtrl.remove_style_class_name("grayout-style");
                break;
            case 8:
                this.keyAlt.remove_style_class_name("grayout-style");
                break;
            case 5:
                this.keyCtrl.remove_style_class_name("grayout-style");
                this.keyShift.remove_style_class_name("grayout-style");
                break;
            case 9:
                this.keyAlt.remove_style_class_name("grayout-style");
                this.keyShift.remove_style_class_name("grayout-style");
                break;
            case 12:
                this.keyAlt.remove_style_class_name("grayout-style");
                this.keyCtrl.remove_style_class_name("grayout-style");
                break;
            case 13:
                this.keyAlt.remove_style_class_name("grayout-style");
                this.keyCtrl.remove_style_class_name("grayout-style");
                this.keyShift.remove_style_class_name("grayout-style");
                break;
            default:
                this.keyAlt.add_style_class_name("grayout-style");
                this.keyCtrl.add_style_class_name("grayout-style");
                this.keyShift.add_style_class_name("grayout-style");
        }
    },

    destroy: function(){
        this.setActive(false);
        this.parent();
    },

});

//according to panel._addToPanelBox function from Github/Gnome-shell/panel.js
function setPosition() {
    let container = keysIndicator.container;
    container.show();
    let parent = container.get_parent();
    if (parent)
        parent.remove_actor(container);

    let side = setting.get_string('position-side');
    let index = setting.get_int('position-index');

    switch (side) {
        case 'left':
            Main.panel._leftBox.insert_child_at_index(container, index);
            break;
        case 'right':
            Main.panel._rightBox.insert_child_at_index(container, index);
            break;
        default:
            Main.panel._rightBox.insert_child_at_index(container, index);
    }

    let destroyId = keysIndicator.connect('destroy', Lang.bind(this, function(emitter) {
        emitter.disconnect(destroyId);
        container.destroy();
    }));
}

function rePosition(){
    if (keysIndicator)
        keysIndicator.destroy();

    //have to create a new class, don't know why
    keysIndicator = new KeysIndicator;
    keysIndicator.setActive(true);

    setPosition();
}


function init(metadata){
    Convenience.initTranslations("keys-indicator");
}


function enable(){

    keysIndicator = new KeysIndicator;
    keysIndicator.setActive(true);
    setPosition();

    sideId = setting.connect('changed::position-side', Lang.bind(this, rePosition));
    indexId = setting.connect('changed::position-index', Lang.bind(this, rePosition));
    styleId = setting.connect('changed::styles', Lang.bind(this, function(){
        keysIndicator.setActive(false);
        keysIndicator.setActive(true);
    }));
}


function disable(){
    keysIndicator.destroy();
    setting.disconnect(sideId);
    setting.disconnect(indexId);
    setting.disconnect(styleId);
}
