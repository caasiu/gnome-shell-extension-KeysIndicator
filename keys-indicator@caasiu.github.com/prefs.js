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

        //extention style
        let StyleBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 10});
        let StyleLabel = new Gtk.Label({label:_("Style:"), xalign:0});
        let StyleWidget = new Gtk.ComboBoxText();
        let styles = {'popup':_("Pop-Up"), 'grayout':_("Gray-Out")};
        for (name in styles) {
            StyleWidget.append(name, styles[name]);
        }

        StyleWidget.set_active_id(setting.get_string('styles'));
        StyleWidget.connect('changed', function(comboWidget) {
            setting.set_string('styles', comboWidget.get_active_id());
        });

        StyleBox.pack_start(StyleLabel, true, true, 0);
        StyleBox.add(StyleWidget);
        this.add(StyleBox);

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

        //attention mode (highlight)
        let AttentionBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 10});
        let AttentionLabel = new Gtk.Label({label:_("Attention highlighting:"), xalign:0});
        let AttentionWidget = new Gtk.ComboBoxText();
        let highlights = {'highlight-red':_("Highlighted"), 'none':_("Disabled")};
        for (id in highlights) {
            AttentionWidget.append(id, highlights[id]);
        }

       AttentionWidget.set_active_id(setting.get_string('highlight-mode'));
       AttentionWidget.connect('changed', function(comboWidget) {
           setting.set_string('highlight-mode', comboWidget.get_active_id());
       });
       AttentionBox.pack_start(AttentionLabel, true, true, 0);
       AttentionBox.add(AttentionWidget);
       this.add(AttentionBox);

        //position index in panel
        let IndexBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin:10});
        let IndexLabel = new Gtk.Label({label:_("Position Index:"), xalign:0});
        let IndexWidget = new Gtk.SpinButton();

        IndexWidget.set_sensitive(true);
        IndexWidget.set_range(0,10);
        IndexWidget.set_value(setting.get_int('position-index'));
        IndexWidget.set_increments(1,2);
        IndexWidget.connect('value-changed', function(w) {
            setting.set_int('position-index', w.get_value_as_int());

        });

        IndexBox.pack_start(IndexLabel, true, true, 0);
        IndexBox.add(IndexWidget);
        this.add(IndexBox);

    },
});


function buildPrefsWidget(){
    let widget = new KeysPrefsWidget(); 

    widget.show_all();

    return widget;
}
