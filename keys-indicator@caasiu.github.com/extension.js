
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

let keysIndicator, sideId, orderId;
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
        //this.capsLock.set_style('color: red; border: 1px solid red;');

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
            this._KeyStatusId = Keymap.connect('state_changed', Lang.bind(this, this._updateStatus));
            //when extension was enabled, check whether numLock or capsLock is on
            this._updateStatus();
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

    destroy: function(){
        this.setActive(false);
        this.parent();
    },

});

//according to panel._addToPanelBox function from Github/Gnome-shell/panel.js
function setPosition() {
    if (keysIndicator)
        keysIndicator.destroy();

    //have to create a new class, don't know why
    keysIndicator = new KeysIndicator;
    keysIndicator.setActive(true);

    let container = keysIndicator.container;
    container.show();
    let parent = container.get_parent();
    if (parent)
        parent.remove_actor(container);

    let side = setting.get_string('position-side');
    let order = setting.get_int('position-order');

    if (side == 'left') {
        if (order >= Main.panel._leftBox.get_n_children()){
            order = 0;
            setting.set_int('position-order', order);
        }
        let index = Main.panel._leftBox.get_n_children() - order - 1;
        Main.panel._leftBox.insert_child_at_index(container, index);
    }
    else if (side == 'right') {
        if (order >= Main.panel._rightBox.get_n_children()){
            order = 0;
            setting.set_int('position-order', order);
        }
        let index = Main.panel._rightBox.get_n_children() - order - 1;
        Main.panel._rightBox.insert_child_at_index(container, index);
    }

    let destroyId = keysIndicator.connect('destroy', Lang.bind(this, function(emitter) {
        emitter.disconnect(destroyId);
        container.destroy();
    }));
}


function init(metadata){
    Convenience.initTranslations("keys-indicator");
}


function enable(){

    keysIndicator = new KeysIndicator;
    keysIndicator.setActive(true);

    setPosition();
    sideId = setting.connect('changed::position-side', Lang.bind(this, setPosition));
    orderId = setting.connect('changed::position-order', Lang.bind(this, setPosition));
}


function disable(){
    keysIndicator.destroy();
    setting.disconnect(sideId);
    setting.disconnect(orderId);
}
