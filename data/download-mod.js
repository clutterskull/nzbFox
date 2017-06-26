/* global self, dialog */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.

        nzbFox (c) 2014 Nick Cooper - https://github.com/NickSC

*/

function log (msg) { self.port.emit('log', msg); }
const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

log('Download prompt detected, MIME = "' + dialog.mLauncher.MIMEInfo.MIMEType + '" suggestedFileName = "' + dialog.mLauncher.suggestedFileName + '"');

if (dialog.mLauncher.MIMEInfo.MIMEType === 'application/x-nzb' || dialog.mLauncher.suggestedFileName.endsWith('.nzb')) {
  var modeGroup = document.getElementById('mode');
  var rememberChoice = document.getElementById('rememberChoice');
  var fileName = dialog.mLauncher.suggestedFileName;

  var createMenuItem = (aMenuPopup, aLabel, aValue = aLabel, aDescription = '') => { // Create a <menuitem> for category list
    if (aLabel !== '' && aMenuPopup) {
      var item = document.createElementNS(XUL_NS, 'menuitem');
      item.setAttribute('label', aLabel);
      item.setAttribute('value', aValue);
      item.setAttribute('description', aDescription);
      return aMenuPopup.appendChild(item);
    } else return false;
  };

  var createSendTo = (id, label) => {
    var container = document.createElementNS(XUL_NS, 'hbox'); // Contains the radio and category list in one row
    container.setAttribute('flex', '1');

    var spacer = document.createElementNS(XUL_NS, 'spacer');
    spacer.setAttribute('flex', '1');

    var radio = document.createElementNS(XUL_NS, 'radio');
    radio.setAttribute('label', label);
    radio.setAttribute('value', id);
    radio.setAttribute('src', self.options.dataURL + 'images/' + id + '-16.png');

    var catList = document.createElementNS(XUL_NS, 'menulist');
    catList.setAttribute('crop', 'center');
    catList.setAttribute('flex', '1');
    catList.setAttribute('readonly', 'true');

    var catListMenu = document.createElementNS(XUL_NS, 'menupopup');
    createMenuItem(catListMenu, 'Category (optional)', '');
    createMenuItem(catListMenu, self.options.prefs.cat_tv);
    createMenuItem(catListMenu, self.options.prefs.cat_movies);
    createMenuItem(catListMenu, self.options.prefs.cat_anime);
    createMenuItem(catListMenu, self.options.prefs.cat_music);
    createMenuItem(catListMenu, self.options.prefs.cat_games);
    createMenuItem(catListMenu, self.options.prefs.cat_reading);
    createMenuItem(catListMenu, self.options.prefs.cat_comics);
    createMenuItem(catListMenu, self.options.prefs.cat_apps);
    createMenuItem(catListMenu, self.options.prefs.cat_adult);

        // Extra Categories
    if (self.options.prefs.cat_custom !== '') {
      var CustomCategories = self.options.prefs.cat_custom.split(',');
      for (let i = 0; i < CustomCategories.length; ++i) { createMenuItem(catListMenu, CustomCategories[i], undefined, '(custom)'); }
    }

    catList.appendChild(catListMenu);

    container.appendChild(radio);
    container.appendChild(spacer);
    container.appendChild(catList);

    return {container: container, radio: radio, catList: catList};
  };

  var sendtoSab;
  if (self.options.prefs.sab_enabled) {
    sendtoSab = createSendTo('sab', 'Send to SABnzbd+');
    modeGroup.appendChild(sendtoSab.container);
  }

  var sendtoNzbg;
  if (self.options.prefs.nzbg_enabled) {
    sendtoNzbg = createSendTo('nzbg', 'Send to NZBGet');
    modeGroup.appendChild(sendtoNzbg.container);
  }

  dialog.onOK_orig = dialog.onOK;
  dialog.onOK = function () {
    var selected;
    if (sendtoNzbg && modeGroup.selectedItem === sendtoNzbg.radio) {
      selected = sendtoNzbg;
    } else if (sendtoSab && modeGroup.selectedItem === sendtoSab.radio) {
      selected = sendtoSab;
    }

    if (typeof selected !== 'undefined') {
      var data = {url: dialog.mLauncher.source.spec, type: selected.radio.value, fileName: fileName, category: selected.catList.value, remember: rememberChoice.checked};
      self.port.emit('nzb-download', data);

      modeGroup.selectedItem = document.getElementById('save');
      rememberChoice.checked = false;
    }
    return dialog.onOK_orig();
  };

  dialog.postShowCallback_orig = dialog.postShowCallback;
  dialog.postShowCallback = function () {
    dialog.postShowCallback_orig();
    if (self.options.prefs.prompt_action !== '') {
      if (sendtoSab && self.options.prefs.prompt_action === sendtoSab.radio.value) { modeGroup.selectedItem = sendtoSab.radio; } else
            if (sendtoNzbg && self.options.prefs.prompt_action === sendtoNzbg.radio.value) { modeGroup.selectedItem = sendtoNzbg.radio; }

      if (modeGroup.selectedItem.value === self.options.prefs.prompt_action) {
        rememberChoice.checked = true;
        dialog.mDialog.document.documentElement.getButton('accept').disabled = false;
        dialog.mDialog.document.documentElement.getButton('accept').click();
      }
    }
  };
}
