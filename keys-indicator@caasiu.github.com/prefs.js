const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('keys-indicator');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const setting = Convenience.getSettings();

function init(){
    Convenience.initTranslations('keys-indicator');
}

const KeysPrefsWidget = new GObject.Class({
    Name: 'KeysIndicator.Prefs.Widget',
    GTypeName: 'KeysPrefsWidget',
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);
        this.set_orientation(Gtk.Orientation.VERTICAL);

        //position side in panel (left/right)
        let SideBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 10});
        let SideLabel = new Gtk.Label({label:_("Position Side:"), xalign:0});
        let SideWidget = new Gtk.ComboBoxText();
        let positions = {'left':_("Left"), 'right':_("Right")};
        for (id in positions) {
            SideWidget.append(id, positions[id]);
        }

        SideWidget.set_active_id(setting.get_string('position-side'));
        SideWidget.connect('changed', function(comboWidget) {
            setting.set_string('position-side', comboWidget.get_active_id());
        });
        SideBox.pack_start(SideLabel, true, true, 0);
        SideBox.add(SideWidget);
        this.add(SideBox);

        
        //position order in panel
        let OrderBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin:10});
        let OrderLabel = new Gtk.Label({label:_("Position Order:"), xalign:0});
        let OrderWidget = new Gtk.SpinButton();

        OrderWidget.set_sensitive(true);
        OrderWidget.set_range(0,10);
        OrderWidget.set_value(setting.get_int('position-order'));
        OrderWidget.set_increments(1,2);
        OrderWidget.connect('value-changed', function(w) {
            setting.set_int('position-order', w.get_value_as_int());

        });

        OrderBox.pack_start(OrderLabel, true, true, 0);
        OrderBox.add(OrderWidget);
        this.add(OrderBox);

    },
});


function buildPrefsWidget(){
    let widget = new KeysPrefsWidget(); 

    widget.show_all();

    return widget;
}
