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

        this.prefKeys = new Gtk.Label({ visible: true,
                                       label: _("Supported Keys: ") });
        this.prefCaps = new Gtk.Label({ visible: true,
                                       label: _("[CapsLock]") });
        //this.prefCaps.set_style('color: red; bindex: 1px solid red;');

        this.prefNum = new Gtk.Label({ visible: true,
                                      label: _("[NumLock]") });

        this.prefCtrl = new Gtk.Label({ visible: true,
                                      label: _("[Ctrl]") });

        this.prefShift = new Gtk.Label({ visible: true,
                                      label: _("[Shift]") });

        this.prefAlt = new Gtk.Label({ visible: true,
                                     label: _("[Alt]") });

        //put all the label together
        let keyLabels = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 0});
        //Todo: add 5 label using one line?
        keyLabels.add(this.prefKeys);
        keyLabels.add(this.prefCtrl);
        keyLabels.add(this.prefShift);
        keyLabels.add(this.prefAlt);
        keyLabels.add(this.prefCaps);
        keyLabels.add(this.prefNum);

        let introLabel = new Gtk.Label({label:_("Please choose your favorite style and highlighting mode. You can directly test it, to see the differences!"), wrap: true, xalign:0});
        let blankLabel = new Gtk.Label({label:_("")});

        let introBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, margin: 10});
        introBox.pack_start(keyLabels, true, true, 0);
        introBox.add(blankLabel);
        introBox.add(introLabel);
        this.add(introBox);

        //extention style
        let StyleBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 10});
        let StyleLabel = new Gtk.Label({label:_("Style:"), xalign:0});
        let StyleWidget = new Gtk.ComboBoxText();
        let styles = {'popup':_("Pop-Up each"), 'less':_("Less disruptive"), 'grayout':_("Gray-Out unpressed")};
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

        //attention mode (highlight)
        let AttentionBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 10});
        let AttentionLabel = new Gtk.Label({label:_("Highlight if CAPS=on / NUM=off:"), xalign:0});
        let AttentionWidget = new Gtk.ComboBoxText();
        let highlights = {'highlight-red':_("Highlight in red"), 'none':_("Disable")};
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

        //position side in panel (left/right)
        let SideBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 10});
        let SideLabel = new Gtk.Label({label:_("Panel Side:"), xalign:0});
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

        //position index in panel
        let IndexBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin:10});
        let IndexLabel = new Gtk.Label({label:_("Panel Position Index:"), xalign:0});
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

        let FootnoteBox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, margin: 10});
        let FootnoteLabel = new Gtk.Label({label:_(""), xalign:0});
        FootnoteBox.pack_start(FootnoteLabel, true, true, 0);
        //link to extensions.gnome website
        let linkGnome = new Gtk.LinkButton({
            uri: "https://extensions.gnome.org/extension/1105/keys-indicator/",
            label: _("leave a comment")});
        FootnoteBox.add(linkGnome);
        //link to github project
        let linkGitHub = new Gtk.LinkButton({
            uri: "https://github.com/caasiu/gnome-shell-extension-KeysIndicator",
            label: _("project on github")});
        FootnoteBox.add(linkGitHub);
        this.add(FootnoteBox);
    },
});


function buildPrefsWidget(){
    let widget = new KeysPrefsWidget(); 

    widget.show_all();

    return widget;
}
