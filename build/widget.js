"use strict";

/**
 * RemoteStorage connect widget
 * @constructor
 * @param {object} remoteStorage - remoteStorage instance
 * @param {object} options - Widget options (domID, ...)
 */
var RemoteStorageWidget = function RemoteStorageWidget(remoteStorage) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  this.rs = remoteStorage;
  console.debug("Initializing widget for ", this.rs);

  this.insertHtmlTemplate(options.domID);

  // CSS can't animate to unknown height (as in height: auto)
  // so we need to store the height, set it to 0 and use it when we want the animation
  this.chooseBox = document.querySelector('.rs-box-choose');
  this.chooseBoxHeight = this.chooseBox.clientHeight;
  // Set the height to zero until the initial button is clicked
  this.chooseBox.setAttribute("style", "height: 0");

  this.signInBox = document.querySelector('.rs-box-sign-in');
  this.signInContent = document.querySelector('.rs-sign-in-content');
  this.signInContentHeight = this.signInContent.clientHeight;

  this.rsWidget = document.querySelector('#rs-widget');
  this.rsLogo = document.querySelector('.rs-main-logo');
  this.rsCloseButton = document.querySelector('.rs-close');
  this.rsInitial = document.querySelector('.rs-box-initial');
  this.rsChooseRemoteStorageButton = document.querySelector('button.rs-choose-rs');
  this.rsChooseDropboxButton = document.querySelector('button.rs-choose-dropbox');
  this.rsChooseGoogleDriveButton = document.querySelector('button.rs-choose-gdrive');
  this.rsDisconnectButton = document.querySelector('.rs-disconnect');
  this.rsSyncButton = document.querySelector('.rs-sync');
  this.rsConnected = document.querySelector('.rs-box-connected');

  this.setAssetUrls();
  this.setEventListeners();
  this.setClickHandlers();
};

RemoteStorageWidget.prototype = {
  insertHtmlTemplate: function insertHtmlTemplate() {
    var elementId = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var element = document.createElement('div');
    var style = document.createElement('style');
    style.innerHTML = RemoteStorage.Assets.styles;

    element.id = "remotestorage-widget";
    element.innerHTML = RemoteStorage.Assets.widget;
    element.appendChild(style);

    if (elementId) {
      var parent = document.getElementById(elementId);
      if (!parent) {
        throw "Failed to find target DOM element with id=\"" + elementId + "\"";
      }
      parent.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
  },
  setAssetUrls: function setAssetUrls() {
    this.rsCloseButton.src = RemoteStorage.Assets.close;
    this.rsLogo.src = RemoteStorage.Assets.remoteStorage;
    document.querySelector('.rs-logo').src = RemoteStorage.Assets.remoteStorage;
    document.querySelector('.dropbox-logo').src = RemoteStorage.Assets.dropbox;
    document.querySelector('.gdrive-logo').src = RemoteStorage.Assets.gdrive;
    document.querySelector('.rs-power-icon').src = RemoteStorage.Assets.power;
    document.querySelector('.rs-loop-icon').src = RemoteStorage.Assets.loop;
  },
  setEventListeners: function setEventListeners() {
    // Sign-in form
    var rsSignInForm = document.querySelector('.rs-sign-in-form');
    rsSignInForm.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  },
  setClickHandlers: function setClickHandlers() {
    var _this = this;

    // Initial button
    this.rsInitial.addEventListener('click', function () {
      console.log("clicked initial button");
      _this.rsWidget.classList.remove("rs-state-initial");
      _this.rsWidget.classList.add("rs-state-choose");
      _this.fadeOut(_this.rsInitial);
      // Set height of the ChooseBox back to original height.
      _this.chooseBox.setAttribute("style", "height: " + _this.chooseBoxHeight);
    });

    // Choose RS button
    this.rsChooseRemoteStorageButton.addEventListener('click', function () {
      console.log("clicked RS button");
      _this.rsWidget.classList.remove("rs-state-choose");
      _this.rsWidget.classList.add("rs-state-sign-in");
      _this.chooseBox.setAttribute("style", "height: 0");
      _this.signInBox.setAttribute("style", "height: " + _this.chooseBoxHeight + "px"); // Set the sign in box to same height as chooseBox
      _this.signInContent.setAttribute("style", "padding-top: " + (_this.chooseBoxHeight - _this.signInContentHeight) / 2 + "px"); // Center it
    });

    // Choose Dropbox button
    this.rsChooseDropboxButton.addEventListener('click', function () {
      console.log("clicked Dropbox button");
      _this.rsWidget.classList.remove("rs-state-choose");
      _this.rsWidget.classList.add("rs-state-connected");
      _this.chooseBox.setAttribute("style", "height: 0");
      _this.delayFadeIn(_this.rsConnected, 600);
    });

    // Choose Google drive button
    this.rsChooseGoogleDriveButton.addEventListener('click', function () {
      console.log("clicked Google drive Button");
      _this.rsWidget.classList.remove("rs-state-choose");
      _this.rsWidget.classList.add("rs-state-connected");
      _this.chooseBox.setAttribute("style", "height: 0");
      _this.delayFadeIn(_this.rsConnected, 600);
    });

    // Disconnect button
    this.rsDisconnectButton.addEventListener('click', function () {
      console.log("clicked disconnect button");
      _this.rsWidget.classList.remove("rs-state-connected");
      _this.rsWidget.classList.add("rs-state-initial");
      _this.fadeOut(_this.rsConnected);
      _this.delayFadeIn(_this.rsInitial, 300);
    });

    // Sync button
    this.rsSyncButton.addEventListener('click', function () {
      console.log("clicked sync button");
      _this.rsSyncButton.classList.toggle("rs-rotate");
    });

    // Close button
    this.rsCloseButton.addEventListener('click', function () {
      console.log("clicked close button");
      _this.closeWidget();
    });

    // Reduce to only icon if connected and clicked outside of widget
    document.addEventListener('click', function () {
      console.log("clicked outside of widget");
      if (_this.rsWidget.classList.contains("rs-state-connected")) {
        _this.rsWidget.classList.toggle("rs-hide", true);
        _this.fadeOut(_this.rsConnected);
      } else {
        _this.closeWidget();
      }
    });

    // Stop clicks on the widget itthis from triggering the above event
    this.rsWidget.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    // Click on the logo to bring the full widget back
    this.rsLogo.addEventListener('click', function () {
      if (_this.rsWidget.classList.contains("rs-state-connected")) {
        _this.rsWidget.classList.toggle("rs-hide", false);
        _this.delayFadeIn(_this.rsConnected, 300);
      }
    });
  },
  closeWidget: function closeWidget() {
    this.rsWidget.classList.remove("rs-state-sign-in");
    this.rsWidget.classList.remove("rs-state-choose");
    this.delayFadeIn(this.rsInitial, 300);
    this.signInBox.setAttribute("style", "height: 0;");
    this.chooseBox.setAttribute("style", "height: 0;");
  },


  // To delay fadeIn until other animations are finished
  delayFadeIn: function delayFadeIn(element, delayTime) {
    var _this2 = this;

    setTimeout(function () {
      _this2.fadeIn(element);
    }, delayTime);
  },


  // CSS can't fade elements in and out of the page flow so we have to do it in JS
  fadeOut: function fadeOut(element) {
    var op = 1; // initial opacity
    var timer = setInterval(function () {
      if (op <= 0.1) {
        clearInterval(timer);
        element.style.display = "none";
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op -= op * 0.1;
    }, 3);
  },
  fadeIn: function fadeIn(element) {
    var op = 0.1; // initial opacity
    element.style.display = "block";
    var timer = setInterval(function () {
      if (op >= 1) {
        clearInterval(timer);
      }
      element.style.opacity = op;
      element.style.filter = "alpha(opacity=" + op * 100 + ")";
      op += op * 0.1;
    }, 3);
  }
};

RemoteStorage.prototype.displayWidget = function (options) {
  this.widget = new RemoteStorageWidget(this, options);
};

