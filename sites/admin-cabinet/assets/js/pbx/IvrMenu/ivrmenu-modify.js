"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global globalRootUrl, ivrActions, globalTranslate, Form, Extensions */
$.fn.form.settings.rules.existRule = function () {
  return $('#extension-error').hasClass('hidden');
};

var ivrMenu = {
  $formObj: $('#ivr-menu-form'),
  $dropDowns: $('#ivr-menu-form .ui.dropdown'),
  $number: $('#extension'),
  $dirrtyField: $('#dirrty'),
  $errorMessages: $('#form-error-messages'),
  $rowTemplate: $('#row-template'),
  defaultExtension: '',
  actionsRowsCount: 0,
  validateRules: {
    name: {
      identifier: 'name',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.iv_ValidateNameIsEmpty
      }]
    },
    extension: {
      identifier: 'extension',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.iv_ValidateExtensionIsEmpty
      }, {
        type: 'existRule',
        prompt: globalTranslate.iv_ValidateExtensionIsDouble
      }]
    },
    timeout_extension: {
      identifier: 'timeout_extension',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.iv_ValidateTimeoutExtensionIsEmpty
      }]
    },
    audio_message_id: {
      identifier: 'audio_message_id',
      rules: [{
        type: 'empty',
        prompt: globalTranslate.iv_ValidateAudioFileIsEmpty
      }]
    },
    timeout: {
      identifier: 'timeout',
      rules: [{
        type: 'integer[0..99]',
        prompt: globalTranslate.iv_ValidateTimeoutOutOfRange
      }]
    },
    number_of_repeat: {
      identifier: 'number_of_repeat',
      rules: [{
        type: 'integer[0..99]',
        prompt: globalTranslate.iv_ValidateRepeatNumberOutOfRange
      }]
    }
  },
  initialize: function () {
    function initialize() {
      ivrMenu.$dropDowns.dropdown(); // Динамическая прововерка свободен ли выбранный номер

      ivrMenu.$number.on('change', function () {
        var newNumber = ivrMenu.$formObj.form('get value', 'extension');
        Extensions.checkAvailability(ivrMenu.defaultNumber, newNumber);
      });
      $('#add-new-ivr-action').on('click', function (el) {
        ivrMenu.addNewActionRow();
        ivrMenu.rebuildActionExtensionsDropdown();
        ivrMenu.$dirrtyField.val(Math.random());
        ivrMenu.$dirrtyField.trigger('change');
        el.preventDefault();
      });
      ivrMenu.initializeForm();
      ivrMenu.buildIvrMenuActions();
      ivrMenu.defaultExtension = ivrMenu.$formObj.form('get value', 'extension');
    }

    return initialize;
  }(),

  /**
   * Create ivr menu items on the form
   */
  buildIvrMenuActions: function () {
    function buildIvrMenuActions() {
      var objActions = JSON.parse(ivrActions);
      objActions.forEach(function (element) {
        ivrMenu.addNewActionRow(element);
      });
      if (objActions.length === 0) ivrMenu.addNewActionRow();
      ivrMenu.rebuildActionExtensionsDropdown();
    }

    return buildIvrMenuActions;
  }(),
  addNewFormRules: function () {
    function addNewFormRules(newRowId) {
      var $digitsClass = "digits-".concat(newRowId);
      ivrMenu.validateRules[$digitsClass] = {
        identifier: $digitsClass,
        rules: [{
          type: 'regExp[/^[0-9]{1,7}$/]',
          prompt: globalTranslate.iv_ValidateDigitsIsNotCorrect
        }, {
          type: 'checkDoublesDigits',
          prompt: globalTranslate.iv_ValidateDigitsIsNotCorrect
        }]
      };
      var $extensionClass = "extension-".concat(newRowId);
      ivrMenu.validateRules[$extensionClass] = {
        identifier: $extensionClass,
        rules: [{
          type: 'empty',
          prompt: globalTranslate.iv_ValidateExtensionIsNotCorrect
        }]
      };
    }

    return addNewFormRules;
  }(),
  addNewActionRow: function () {
    function addNewActionRow(paramObj) {
      var param = {
        id: '',
        extension: '',
        extensionRepresent: '',
        digits: ''
      };

      if (paramObj !== undefined) {
        param = paramObj;
      }

      ivrMenu.actionsRowsCount += 1;
      var $actionTemplate = ivrMenu.$rowTemplate.clone();
      $actionTemplate.removeClass('hidden').attr('id', "row-".concat(ivrMenu.actionsRowsCount)).attr('data-value', ivrMenu.actionsRowsCount).attr('style', '');
      $actionTemplate.find('input[name="digits-id"]').attr('id', "digits-".concat(ivrMenu.actionsRowsCount)).attr('name', "digits-".concat(ivrMenu.actionsRowsCount)).attr('value', param.digits);
      $actionTemplate.find('input[name="extension-id"]').attr('id', "extension-".concat(ivrMenu.actionsRowsCount)).attr('name', "extension-".concat(ivrMenu.actionsRowsCount)).attr('value', param.extension);
      $actionTemplate.find('div.delete-action-row').attr('data-value', ivrMenu.actionsRowsCount);

      if (param.extensionRepresent.length > 0) {
        $actionTemplate.find('div.default.text').removeClass('default').html(param.extensionRepresent);
      } else {
        $actionTemplate.find('div.default.text').html(globalTranslate.ex_SelectNumber);
      }

      $('#actions-place').append($actionTemplate);
      ivrMenu.addNewFormRules(ivrMenu.actionsRowsCount);
    }

    return addNewActionRow;
  }(),
  rebuildActionExtensionsDropdown: function () {
    function rebuildActionExtensionsDropdown() {
      $('#ivr-menu-form .forwarding-select').dropdown(Extensions.getDropdownSettingsWithoutEmpty(ivrMenu.cbOnExtensionSelect));
      $('.delete-action-row').on('click', function (e) {
        e.preventDefault();
        var id = $(this).attr('data-value');
        delete ivrMenu.validateRules["digits-".concat(id)];
        delete ivrMenu.validateRules["extension-".concat(id)];
        $("#row-".concat(id)).remove();
        ivrMenu.$dirrtyField.val(Math.random());
        ivrMenu.$dirrtyField.trigger('change');
      });
    }

    return rebuildActionExtensionsDropdown;
  }(),
  cbBeforeSendForm: function () {
    function cbBeforeSendForm(settings) {
      var result = settings;
      result.data = ivrMenu.$formObj.form('get values');
      var arrActions = [];
      $('.action-row').each(function (index, obj) {
        var rowId = $(obj).attr('data-value');

        if (rowId > 0) {
          arrActions.push({
            digits: ivrMenu.$formObj.form('get value', "digits-".concat(rowId)),
            extension: ivrMenu.$formObj.form('get value', "extension-".concat(rowId))
          });
        }
      });

      if (arrActions.length === 0) {
        result = false;
        ivrMenu.$errorMessages.html(globalTranslate.iv_ValidateNoIVRExtensions);
        ivrMenu.$formObj.addClass('error');
      } else {
        result.data.actions = JSON.stringify(arrActions);
      }

      return result;
    }

    return cbBeforeSendForm;
  }(),

  /**
   * Срабатывает при выборе номера из выпадающего списка
   */
  cbOnExtensionSelect: function () {
    function cbOnExtensionSelect() {
      ivrMenu.$dirrtyField.val(Math.random());
      ivrMenu.$dirrtyField.trigger('change');
    }

    return cbOnExtensionSelect;
  }(),
  cbAfterSendForm: function () {
    function cbAfterSendForm() {}

    return cbAfterSendForm;
  }(),
  initializeForm: function () {
    function initializeForm() {
      Form.$formObj = ivrMenu.$formObj;
      Form.url = "".concat(globalRootUrl, "ivr-menu/save");
      Form.validateRules = ivrMenu.validateRules;
      Form.cbBeforeSendForm = ivrMenu.cbBeforeSendForm;
      Form.cbAfterSendForm = ivrMenu.cbAfterSendForm;
      Form.initialize();
    }

    return initializeForm;
  }()
};

$.fn.form.settings.rules.checkDoublesDigits = function (value) {
  var count = 0;
  $("input[id^='digits']").each(function (index, obj) {
    if (ivrMenu.$formObj.form('get value', "".concat(obj.id)) === value) count += 1;
  });
  return count === 1;
};

$(document).ready(function () {
  ivrMenu.initialize();
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9JdnJNZW51L2l2cm1lbnUtbW9kaWZ5LmpzIl0sIm5hbWVzIjpbIiQiLCJmbiIsImZvcm0iLCJzZXR0aW5ncyIsInJ1bGVzIiwiZXhpc3RSdWxlIiwiaGFzQ2xhc3MiLCJpdnJNZW51IiwiJGZvcm1PYmoiLCIkZHJvcERvd25zIiwiJG51bWJlciIsIiRkaXJydHlGaWVsZCIsIiRlcnJvck1lc3NhZ2VzIiwiJHJvd1RlbXBsYXRlIiwiZGVmYXVsdEV4dGVuc2lvbiIsImFjdGlvbnNSb3dzQ291bnQiLCJ2YWxpZGF0ZVJ1bGVzIiwibmFtZSIsImlkZW50aWZpZXIiLCJ0eXBlIiwicHJvbXB0IiwiZ2xvYmFsVHJhbnNsYXRlIiwiaXZfVmFsaWRhdGVOYW1lSXNFbXB0eSIsImV4dGVuc2lvbiIsIml2X1ZhbGlkYXRlRXh0ZW5zaW9uSXNFbXB0eSIsIml2X1ZhbGlkYXRlRXh0ZW5zaW9uSXNEb3VibGUiLCJ0aW1lb3V0X2V4dGVuc2lvbiIsIml2X1ZhbGlkYXRlVGltZW91dEV4dGVuc2lvbklzRW1wdHkiLCJhdWRpb19tZXNzYWdlX2lkIiwiaXZfVmFsaWRhdGVBdWRpb0ZpbGVJc0VtcHR5IiwidGltZW91dCIsIml2X1ZhbGlkYXRlVGltZW91dE91dE9mUmFuZ2UiLCJudW1iZXJfb2ZfcmVwZWF0IiwiaXZfVmFsaWRhdGVSZXBlYXROdW1iZXJPdXRPZlJhbmdlIiwiaW5pdGlhbGl6ZSIsImRyb3Bkb3duIiwib24iLCJuZXdOdW1iZXIiLCJFeHRlbnNpb25zIiwiY2hlY2tBdmFpbGFiaWxpdHkiLCJkZWZhdWx0TnVtYmVyIiwiZWwiLCJhZGROZXdBY3Rpb25Sb3ciLCJyZWJ1aWxkQWN0aW9uRXh0ZW5zaW9uc0Ryb3Bkb3duIiwidmFsIiwiTWF0aCIsInJhbmRvbSIsInRyaWdnZXIiLCJwcmV2ZW50RGVmYXVsdCIsImluaXRpYWxpemVGb3JtIiwiYnVpbGRJdnJNZW51QWN0aW9ucyIsIm9iakFjdGlvbnMiLCJKU09OIiwicGFyc2UiLCJpdnJBY3Rpb25zIiwiZm9yRWFjaCIsImVsZW1lbnQiLCJsZW5ndGgiLCJhZGROZXdGb3JtUnVsZXMiLCJuZXdSb3dJZCIsIiRkaWdpdHNDbGFzcyIsIml2X1ZhbGlkYXRlRGlnaXRzSXNOb3RDb3JyZWN0IiwiJGV4dGVuc2lvbkNsYXNzIiwiaXZfVmFsaWRhdGVFeHRlbnNpb25Jc05vdENvcnJlY3QiLCJwYXJhbU9iaiIsInBhcmFtIiwiaWQiLCJleHRlbnNpb25SZXByZXNlbnQiLCJkaWdpdHMiLCJ1bmRlZmluZWQiLCIkYWN0aW9uVGVtcGxhdGUiLCJjbG9uZSIsInJlbW92ZUNsYXNzIiwiYXR0ciIsImZpbmQiLCJodG1sIiwiZXhfU2VsZWN0TnVtYmVyIiwiYXBwZW5kIiwiZ2V0RHJvcGRvd25TZXR0aW5nc1dpdGhvdXRFbXB0eSIsImNiT25FeHRlbnNpb25TZWxlY3QiLCJlIiwicmVtb3ZlIiwiY2JCZWZvcmVTZW5kRm9ybSIsInJlc3VsdCIsImRhdGEiLCJhcnJBY3Rpb25zIiwiZWFjaCIsImluZGV4Iiwib2JqIiwicm93SWQiLCJwdXNoIiwiaXZfVmFsaWRhdGVOb0lWUkV4dGVuc2lvbnMiLCJhZGRDbGFzcyIsImFjdGlvbnMiLCJzdHJpbmdpZnkiLCJjYkFmdGVyU2VuZEZvcm0iLCJGb3JtIiwidXJsIiwiZ2xvYmFsUm9vdFVybCIsImNoZWNrRG91Ymxlc0RpZ2l0cyIsInZhbHVlIiwiY291bnQiLCJkb2N1bWVudCIsInJlYWR5Il0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVFBO0FBRUFBLENBQUMsQ0FBQ0MsRUFBRixDQUFLQyxJQUFMLENBQVVDLFFBQVYsQ0FBbUJDLEtBQW5CLENBQXlCQyxTQUF6QixHQUFxQztBQUFBLFNBQU1MLENBQUMsQ0FBQyxrQkFBRCxDQUFELENBQXNCTSxRQUF0QixDQUErQixRQUEvQixDQUFOO0FBQUEsQ0FBckM7O0FBRUEsSUFBTUMsT0FBTyxHQUFHO0FBQ2ZDLEVBQUFBLFFBQVEsRUFBRVIsQ0FBQyxDQUFDLGdCQUFELENBREk7QUFFZlMsRUFBQUEsVUFBVSxFQUFFVCxDQUFDLENBQUMsNkJBQUQsQ0FGRTtBQUdmVSxFQUFBQSxPQUFPLEVBQUVWLENBQUMsQ0FBQyxZQUFELENBSEs7QUFJZlcsRUFBQUEsWUFBWSxFQUFFWCxDQUFDLENBQUMsU0FBRCxDQUpBO0FBS2ZZLEVBQUFBLGNBQWMsRUFBRVosQ0FBQyxDQUFDLHNCQUFELENBTEY7QUFNZmEsRUFBQUEsWUFBWSxFQUFFYixDQUFDLENBQUMsZUFBRCxDQU5BO0FBT2ZjLEVBQUFBLGdCQUFnQixFQUFFLEVBUEg7QUFRZkMsRUFBQUEsZ0JBQWdCLEVBQUUsQ0FSSDtBQVNmQyxFQUFBQSxhQUFhLEVBQUU7QUFDZEMsSUFBQUEsSUFBSSxFQUFFO0FBQ0xDLE1BQUFBLFVBQVUsRUFBRSxNQURQO0FBRUxkLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NlLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDQztBQUZ6QixPQURNO0FBRkYsS0FEUTtBQVVkQyxJQUFBQSxTQUFTLEVBQUU7QUFDVkwsTUFBQUEsVUFBVSxFQUFFLFdBREY7QUFFVmQsTUFBQUEsS0FBSyxFQUFFLENBQ047QUFDQ2UsUUFBQUEsSUFBSSxFQUFFLE9BRFA7QUFFQ0MsUUFBQUEsTUFBTSxFQUFFQyxlQUFlLENBQUNHO0FBRnpCLE9BRE0sRUFLTjtBQUNDTCxRQUFBQSxJQUFJLEVBQUUsV0FEUDtBQUVDQyxRQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ0k7QUFGekIsT0FMTTtBQUZHLEtBVkc7QUF1QmRDLElBQUFBLGlCQUFpQixFQUFFO0FBQ2xCUixNQUFBQSxVQUFVLEVBQUUsbUJBRE07QUFFbEJkLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NlLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDTTtBQUZ6QixPQURNO0FBRlcsS0F2Qkw7QUFnQ2RDLElBQUFBLGdCQUFnQixFQUFFO0FBQ2pCVixNQUFBQSxVQUFVLEVBQUUsa0JBREs7QUFFakJkLE1BQUFBLEtBQUssRUFBRSxDQUNOO0FBQ0NlLFFBQUFBLElBQUksRUFBRSxPQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDUTtBQUZ6QixPQURNO0FBRlUsS0FoQ0o7QUF5Q2RDLElBQUFBLE9BQU8sRUFBRTtBQUNSWixNQUFBQSxVQUFVLEVBQUUsU0FESjtBQUVSZCxNQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDZSxRQUFBQSxJQUFJLEVBQUUsZ0JBRFA7QUFFQ0MsUUFBQUEsTUFBTSxFQUFFQyxlQUFlLENBQUNVO0FBRnpCLE9BRE07QUFGQyxLQXpDSztBQWtEZEMsSUFBQUEsZ0JBQWdCLEVBQUU7QUFDakJkLE1BQUFBLFVBQVUsRUFBRSxrQkFESztBQUVqQmQsTUFBQUEsS0FBSyxFQUFFLENBQ047QUFDQ2UsUUFBQUEsSUFBSSxFQUFFLGdCQURQO0FBRUNDLFFBQUFBLE1BQU0sRUFBRUMsZUFBZSxDQUFDWTtBQUZ6QixPQURNO0FBRlU7QUFsREosR0FUQTtBQXNFZkMsRUFBQUEsVUF0RWU7QUFBQSwwQkFzRUY7QUFDWjNCLE1BQUFBLE9BQU8sQ0FBQ0UsVUFBUixDQUFtQjBCLFFBQW5CLEdBRFksQ0FHWjs7QUFDQTVCLE1BQUFBLE9BQU8sQ0FBQ0csT0FBUixDQUFnQjBCLEVBQWhCLENBQW1CLFFBQW5CLEVBQTZCLFlBQU07QUFDbEMsWUFBTUMsU0FBUyxHQUFHOUIsT0FBTyxDQUFDQyxRQUFSLENBQWlCTixJQUFqQixDQUFzQixXQUF0QixFQUFtQyxXQUFuQyxDQUFsQjtBQUNBb0MsUUFBQUEsVUFBVSxDQUFDQyxpQkFBWCxDQUE2QmhDLE9BQU8sQ0FBQ2lDLGFBQXJDLEVBQW9ESCxTQUFwRDtBQUNBLE9BSEQ7QUFLQXJDLE1BQUFBLENBQUMsQ0FBQyxxQkFBRCxDQUFELENBQXlCb0MsRUFBekIsQ0FBNEIsT0FBNUIsRUFBcUMsVUFBQ0ssRUFBRCxFQUFRO0FBQzVDbEMsUUFBQUEsT0FBTyxDQUFDbUMsZUFBUjtBQUNBbkMsUUFBQUEsT0FBTyxDQUFDb0MsK0JBQVI7QUFDQXBDLFFBQUFBLE9BQU8sQ0FBQ0ksWUFBUixDQUFxQmlDLEdBQXJCLENBQXlCQyxJQUFJLENBQUNDLE1BQUwsRUFBekI7QUFDQXZDLFFBQUFBLE9BQU8sQ0FBQ0ksWUFBUixDQUFxQm9DLE9BQXJCLENBQTZCLFFBQTdCO0FBQ0FOLFFBQUFBLEVBQUUsQ0FBQ08sY0FBSDtBQUNBLE9BTkQ7QUFPQXpDLE1BQUFBLE9BQU8sQ0FBQzBDLGNBQVI7QUFFQTFDLE1BQUFBLE9BQU8sQ0FBQzJDLG1CQUFSO0FBRUEzQyxNQUFBQSxPQUFPLENBQUNPLGdCQUFSLEdBQTJCUCxPQUFPLENBQUNDLFFBQVIsQ0FBaUJOLElBQWpCLENBQXNCLFdBQXRCLEVBQW1DLFdBQW5DLENBQTNCO0FBQ0E7O0FBM0ZjO0FBQUE7O0FBNEZmOzs7QUFHQWdELEVBQUFBLG1CQS9GZTtBQUFBLG1DQStGTztBQUNyQixVQUFNQyxVQUFVLEdBQUdDLElBQUksQ0FBQ0MsS0FBTCxDQUFXQyxVQUFYLENBQW5CO0FBQ0FILE1BQUFBLFVBQVUsQ0FBQ0ksT0FBWCxDQUFtQixVQUFDQyxPQUFELEVBQWE7QUFDL0JqRCxRQUFBQSxPQUFPLENBQUNtQyxlQUFSLENBQXdCYyxPQUF4QjtBQUNBLE9BRkQ7QUFHQSxVQUFJTCxVQUFVLENBQUNNLE1BQVgsS0FBc0IsQ0FBMUIsRUFBNkJsRCxPQUFPLENBQUNtQyxlQUFSO0FBRTdCbkMsTUFBQUEsT0FBTyxDQUFDb0MsK0JBQVI7QUFDQTs7QUF2R2M7QUFBQTtBQXdHZmUsRUFBQUEsZUF4R2U7QUFBQSw2QkF3R0NDLFFBeEdELEVBd0dXO0FBQ3pCLFVBQU1DLFlBQVksb0JBQWFELFFBQWIsQ0FBbEI7QUFDQXBELE1BQUFBLE9BQU8sQ0FBQ1MsYUFBUixDQUFzQjRDLFlBQXRCLElBQXNDO0FBQ3JDMUMsUUFBQUEsVUFBVSxFQUFFMEMsWUFEeUI7QUFFckN4RCxRQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDZSxVQUFBQSxJQUFJLEVBQUUsd0JBRFA7QUFFQ0MsVUFBQUEsTUFBTSxFQUFFQyxlQUFlLENBQUN3QztBQUZ6QixTQURNLEVBS047QUFDQzFDLFVBQUFBLElBQUksRUFBRSxvQkFEUDtBQUVDQyxVQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQ3dDO0FBRnpCLFNBTE07QUFGOEIsT0FBdEM7QUFjQSxVQUFNQyxlQUFlLHVCQUFnQkgsUUFBaEIsQ0FBckI7QUFDQXBELE1BQUFBLE9BQU8sQ0FBQ1MsYUFBUixDQUFzQjhDLGVBQXRCLElBQXlDO0FBQ3hDNUMsUUFBQUEsVUFBVSxFQUFFNEMsZUFENEI7QUFFeEMxRCxRQUFBQSxLQUFLLEVBQUUsQ0FDTjtBQUNDZSxVQUFBQSxJQUFJLEVBQUUsT0FEUDtBQUVDQyxVQUFBQSxNQUFNLEVBQUVDLGVBQWUsQ0FBQzBDO0FBRnpCLFNBRE07QUFGaUMsT0FBekM7QUFVQTs7QUFuSWM7QUFBQTtBQW9JZnJCLEVBQUFBLGVBcEllO0FBQUEsNkJBb0lDc0IsUUFwSUQsRUFvSVc7QUFDekIsVUFBSUMsS0FBSyxHQUFHO0FBQ1hDLFFBQUFBLEVBQUUsRUFBRSxFQURPO0FBRVgzQyxRQUFBQSxTQUFTLEVBQUUsRUFGQTtBQUdYNEMsUUFBQUEsa0JBQWtCLEVBQUUsRUFIVDtBQUlYQyxRQUFBQSxNQUFNLEVBQUU7QUFKRyxPQUFaOztBQU1BLFVBQUlKLFFBQVEsS0FBS0ssU0FBakIsRUFBNEI7QUFDM0JKLFFBQUFBLEtBQUssR0FBR0QsUUFBUjtBQUNBOztBQUNEekQsTUFBQUEsT0FBTyxDQUFDUSxnQkFBUixJQUE0QixDQUE1QjtBQUNBLFVBQU11RCxlQUFlLEdBQUcvRCxPQUFPLENBQUNNLFlBQVIsQ0FBcUIwRCxLQUFyQixFQUF4QjtBQUNBRCxNQUFBQSxlQUFlLENBQ2JFLFdBREYsQ0FDYyxRQURkLEVBRUVDLElBRkYsQ0FFTyxJQUZQLGdCQUVvQmxFLE9BQU8sQ0FBQ1EsZ0JBRjVCLEdBR0UwRCxJQUhGLENBR08sWUFIUCxFQUdxQmxFLE9BQU8sQ0FBQ1EsZ0JBSDdCLEVBSUUwRCxJQUpGLENBSU8sT0FKUCxFQUlnQixFQUpoQjtBQU1BSCxNQUFBQSxlQUFlLENBQUNJLElBQWhCLENBQXFCLHlCQUFyQixFQUNFRCxJQURGLENBQ08sSUFEUCxtQkFDdUJsRSxPQUFPLENBQUNRLGdCQUQvQixHQUVFMEQsSUFGRixDQUVPLE1BRlAsbUJBRXlCbEUsT0FBTyxDQUFDUSxnQkFGakMsR0FHRTBELElBSEYsQ0FHTyxPQUhQLEVBR2dCUixLQUFLLENBQUNHLE1BSHRCO0FBS0FFLE1BQUFBLGVBQWUsQ0FBQ0ksSUFBaEIsQ0FBcUIsNEJBQXJCLEVBQ0VELElBREYsQ0FDTyxJQURQLHNCQUMwQmxFLE9BQU8sQ0FBQ1EsZ0JBRGxDLEdBRUUwRCxJQUZGLENBRU8sTUFGUCxzQkFFNEJsRSxPQUFPLENBQUNRLGdCQUZwQyxHQUdFMEQsSUFIRixDQUdPLE9BSFAsRUFHZ0JSLEtBQUssQ0FBQzFDLFNBSHRCO0FBSUErQyxNQUFBQSxlQUFlLENBQUNJLElBQWhCLENBQXFCLHVCQUFyQixFQUNFRCxJQURGLENBQ08sWUFEUCxFQUNxQmxFLE9BQU8sQ0FBQ1EsZ0JBRDdCOztBQUdBLFVBQUlrRCxLQUFLLENBQUNFLGtCQUFOLENBQXlCVixNQUF6QixHQUFrQyxDQUF0QyxFQUF5QztBQUN4Q2EsUUFBQUEsZUFBZSxDQUFDSSxJQUFoQixDQUFxQixrQkFBckIsRUFBeUNGLFdBQXpDLENBQXFELFNBQXJELEVBQWdFRyxJQUFoRSxDQUFxRVYsS0FBSyxDQUFDRSxrQkFBM0U7QUFDQSxPQUZELE1BRU87QUFDTkcsUUFBQUEsZUFBZSxDQUFDSSxJQUFoQixDQUFxQixrQkFBckIsRUFBeUNDLElBQXpDLENBQThDdEQsZUFBZSxDQUFDdUQsZUFBOUQ7QUFDQTs7QUFFRDVFLE1BQUFBLENBQUMsQ0FBQyxnQkFBRCxDQUFELENBQW9CNkUsTUFBcEIsQ0FBMkJQLGVBQTNCO0FBQ0EvRCxNQUFBQSxPQUFPLENBQUNtRCxlQUFSLENBQXdCbkQsT0FBTyxDQUFDUSxnQkFBaEM7QUFDQTs7QUExS2M7QUFBQTtBQTJLZjRCLEVBQUFBLCtCQTNLZTtBQUFBLCtDQTJLbUI7QUFDakMzQyxNQUFBQSxDQUFDLENBQUMsbUNBQUQsQ0FBRCxDQUF1Q21DLFFBQXZDLENBQWdERyxVQUFVLENBQUN3QywrQkFBWCxDQUEyQ3ZFLE9BQU8sQ0FBQ3dFLG1CQUFuRCxDQUFoRDtBQUNBL0UsTUFBQUEsQ0FBQyxDQUFDLG9CQUFELENBQUQsQ0FBd0JvQyxFQUF4QixDQUEyQixPQUEzQixFQUFvQyxVQUFVNEMsQ0FBVixFQUFhO0FBQ2hEQSxRQUFBQSxDQUFDLENBQUNoQyxjQUFGO0FBQ0EsWUFBTWtCLEVBQUUsR0FBR2xFLENBQUMsQ0FBQyxJQUFELENBQUQsQ0FBUXlFLElBQVIsQ0FBYSxZQUFiLENBQVg7QUFDQSxlQUFPbEUsT0FBTyxDQUFDUyxhQUFSLGtCQUFnQ2tELEVBQWhDLEVBQVA7QUFDQSxlQUFPM0QsT0FBTyxDQUFDUyxhQUFSLHFCQUFtQ2tELEVBQW5DLEVBQVA7QUFDQWxFLFFBQUFBLENBQUMsZ0JBQVNrRSxFQUFULEVBQUQsQ0FBZ0JlLE1BQWhCO0FBQ0ExRSxRQUFBQSxPQUFPLENBQUNJLFlBQVIsQ0FBcUJpQyxHQUFyQixDQUF5QkMsSUFBSSxDQUFDQyxNQUFMLEVBQXpCO0FBQ0F2QyxRQUFBQSxPQUFPLENBQUNJLFlBQVIsQ0FBcUJvQyxPQUFyQixDQUE2QixRQUE3QjtBQUNBLE9BUkQ7QUFTQTs7QUF0TGM7QUFBQTtBQXVMZm1DLEVBQUFBLGdCQXZMZTtBQUFBLDhCQXVMRS9FLFFBdkxGLEVBdUxZO0FBQzFCLFVBQUlnRixNQUFNLEdBQUdoRixRQUFiO0FBRUFnRixNQUFBQSxNQUFNLENBQUNDLElBQVAsR0FBYzdFLE9BQU8sQ0FBQ0MsUUFBUixDQUFpQk4sSUFBakIsQ0FBc0IsWUFBdEIsQ0FBZDtBQUNBLFVBQU1tRixVQUFVLEdBQUcsRUFBbkI7QUFFQXJGLE1BQUFBLENBQUMsQ0FBQyxhQUFELENBQUQsQ0FBaUJzRixJQUFqQixDQUFzQixVQUFDQyxLQUFELEVBQVFDLEdBQVIsRUFBZ0I7QUFDckMsWUFBTUMsS0FBSyxHQUFHekYsQ0FBQyxDQUFDd0YsR0FBRCxDQUFELENBQU9mLElBQVAsQ0FBWSxZQUFaLENBQWQ7O0FBQ0EsWUFBSWdCLEtBQUssR0FBRyxDQUFaLEVBQWU7QUFDZEosVUFBQUEsVUFBVSxDQUFDSyxJQUFYLENBQWdCO0FBQ2Z0QixZQUFBQSxNQUFNLEVBQUU3RCxPQUFPLENBQUNDLFFBQVIsQ0FBaUJOLElBQWpCLENBQXNCLFdBQXRCLG1CQUE2Q3VGLEtBQTdDLEVBRE87QUFFZmxFLFlBQUFBLFNBQVMsRUFBRWhCLE9BQU8sQ0FBQ0MsUUFBUixDQUFpQk4sSUFBakIsQ0FBc0IsV0FBdEIsc0JBQWdEdUYsS0FBaEQ7QUFGSSxXQUFoQjtBQUlBO0FBQ0QsT0FSRDs7QUFTQSxVQUFJSixVQUFVLENBQUM1QixNQUFYLEtBQXNCLENBQTFCLEVBQTZCO0FBQzVCMEIsUUFBQUEsTUFBTSxHQUFHLEtBQVQ7QUFDQTVFLFFBQUFBLE9BQU8sQ0FBQ0ssY0FBUixDQUF1QitELElBQXZCLENBQTRCdEQsZUFBZSxDQUFDc0UsMEJBQTVDO0FBQ0FwRixRQUFBQSxPQUFPLENBQUNDLFFBQVIsQ0FBaUJvRixRQUFqQixDQUEwQixPQUExQjtBQUNBLE9BSkQsTUFJTztBQUNOVCxRQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWVMsT0FBWixHQUFzQnpDLElBQUksQ0FBQzBDLFNBQUwsQ0FBZVQsVUFBZixDQUF0QjtBQUNBOztBQUNELGFBQU9GLE1BQVA7QUFDQTs7QUE5TWM7QUFBQTs7QUErTWY7OztBQUdBSixFQUFBQSxtQkFsTmU7QUFBQSxtQ0FrTk87QUFDckJ4RSxNQUFBQSxPQUFPLENBQUNJLFlBQVIsQ0FBcUJpQyxHQUFyQixDQUF5QkMsSUFBSSxDQUFDQyxNQUFMLEVBQXpCO0FBQ0F2QyxNQUFBQSxPQUFPLENBQUNJLFlBQVIsQ0FBcUJvQyxPQUFyQixDQUE2QixRQUE3QjtBQUNBOztBQXJOYztBQUFBO0FBc05mZ0QsRUFBQUEsZUF0TmU7QUFBQSwrQkFzTkcsQ0FFakI7O0FBeE5jO0FBQUE7QUF5TmY5QyxFQUFBQSxjQXpOZTtBQUFBLDhCQXlORTtBQUNoQitDLE1BQUFBLElBQUksQ0FBQ3hGLFFBQUwsR0FBZ0JELE9BQU8sQ0FBQ0MsUUFBeEI7QUFDQXdGLE1BQUFBLElBQUksQ0FBQ0MsR0FBTCxhQUFjQyxhQUFkO0FBQ0FGLE1BQUFBLElBQUksQ0FBQ2hGLGFBQUwsR0FBcUJULE9BQU8sQ0FBQ1MsYUFBN0I7QUFDQWdGLE1BQUFBLElBQUksQ0FBQ2QsZ0JBQUwsR0FBd0IzRSxPQUFPLENBQUMyRSxnQkFBaEM7QUFDQWMsTUFBQUEsSUFBSSxDQUFDRCxlQUFMLEdBQXVCeEYsT0FBTyxDQUFDd0YsZUFBL0I7QUFDQUMsTUFBQUEsSUFBSSxDQUFDOUQsVUFBTDtBQUNBOztBQWhPYztBQUFBO0FBQUEsQ0FBaEI7O0FBbU9BbEMsQ0FBQyxDQUFDQyxFQUFGLENBQUtDLElBQUwsQ0FBVUMsUUFBVixDQUFtQkMsS0FBbkIsQ0FBeUIrRixrQkFBekIsR0FBOEMsVUFBQ0MsS0FBRCxFQUFXO0FBQ3hELE1BQUlDLEtBQUssR0FBRyxDQUFaO0FBQ0FyRyxFQUFBQSxDQUFDLENBQUMscUJBQUQsQ0FBRCxDQUF5QnNGLElBQXpCLENBQThCLFVBQUNDLEtBQUQsRUFBUUMsR0FBUixFQUFnQjtBQUM3QyxRQUFJakYsT0FBTyxDQUFDQyxRQUFSLENBQWlCTixJQUFqQixDQUFzQixXQUF0QixZQUFzQ3NGLEdBQUcsQ0FBQ3RCLEVBQTFDLE9BQW9Ea0MsS0FBeEQsRUFBK0RDLEtBQUssSUFBSSxDQUFUO0FBQy9ELEdBRkQ7QUFJQSxTQUFRQSxLQUFLLEtBQUssQ0FBbEI7QUFDQSxDQVBEOztBQVNBckcsQ0FBQyxDQUFDc0csUUFBRCxDQUFELENBQVlDLEtBQVosQ0FBa0IsWUFBTTtBQUN2QmhHLEVBQUFBLE9BQU8sQ0FBQzJCLFVBQVI7QUFDQSxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAoQykgTUlLTyBMTEMgLSBBbGwgUmlnaHRzIFJlc2VydmVkXG4gKiBVbmF1dGhvcml6ZWQgY29weWluZyBvZiB0aGlzIGZpbGUsIHZpYSBhbnkgbWVkaXVtIGlzIHN0cmljdGx5IHByb2hpYml0ZWRcbiAqIFByb3ByaWV0YXJ5IGFuZCBjb25maWRlbnRpYWxcbiAqIFdyaXR0ZW4gYnkgTmlrb2xheSBCZWtldG92LCAxMiAyMDE5XG4gKlxuICovXG5cbi8qIGdsb2JhbCBnbG9iYWxSb290VXJsLCBpdnJBY3Rpb25zLCBnbG9iYWxUcmFuc2xhdGUsIEZvcm0sIEV4dGVuc2lvbnMgKi9cblxuJC5mbi5mb3JtLnNldHRpbmdzLnJ1bGVzLmV4aXN0UnVsZSA9ICgpID0+ICQoJyNleHRlbnNpb24tZXJyb3InKS5oYXNDbGFzcygnaGlkZGVuJyk7XG5cbmNvbnN0IGl2ck1lbnUgPSB7XG5cdCRmb3JtT2JqOiAkKCcjaXZyLW1lbnUtZm9ybScpLFxuXHQkZHJvcERvd25zOiAkKCcjaXZyLW1lbnUtZm9ybSAudWkuZHJvcGRvd24nKSxcblx0JG51bWJlcjogJCgnI2V4dGVuc2lvbicpLFxuXHQkZGlycnR5RmllbGQ6ICQoJyNkaXJydHknKSxcblx0JGVycm9yTWVzc2FnZXM6ICQoJyNmb3JtLWVycm9yLW1lc3NhZ2VzJyksXG5cdCRyb3dUZW1wbGF0ZTogJCgnI3Jvdy10ZW1wbGF0ZScpLFxuXHRkZWZhdWx0RXh0ZW5zaW9uOiAnJyxcblx0YWN0aW9uc1Jvd3NDb3VudDogMCxcblx0dmFsaWRhdGVSdWxlczoge1xuXHRcdG5hbWU6IHtcblx0XHRcdGlkZW50aWZpZXI6ICduYW1lJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLml2X1ZhbGlkYXRlTmFtZUlzRW1wdHksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0ZXh0ZW5zaW9uOiB7XG5cdFx0XHRpZGVudGlmaWVyOiAnZXh0ZW5zaW9uJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLml2X1ZhbGlkYXRlRXh0ZW5zaW9uSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdleGlzdFJ1bGUnLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLml2X1ZhbGlkYXRlRXh0ZW5zaW9uSXNEb3VibGUsXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdH0sXG5cdFx0dGltZW91dF9leHRlbnNpb246IHtcblx0XHRcdGlkZW50aWZpZXI6ICd0aW1lb3V0X2V4dGVuc2lvbicsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5pdl9WYWxpZGF0ZVRpbWVvdXRFeHRlbnNpb25Jc0VtcHR5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdGF1ZGlvX21lc3NhZ2VfaWQ6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdhdWRpb19tZXNzYWdlX2lkJyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnZW1wdHknLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLml2X1ZhbGlkYXRlQXVkaW9GaWxlSXNFbXB0eSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0XHR0aW1lb3V0OiB7XG5cdFx0XHRpZGVudGlmaWVyOiAndGltZW91dCcsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2ludGVnZXJbMC4uOTldJyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5pdl9WYWxpZGF0ZVRpbWVvdXRPdXRPZlJhbmdlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHR9LFxuXHRcdG51bWJlcl9vZl9yZXBlYXQ6IHtcblx0XHRcdGlkZW50aWZpZXI6ICdudW1iZXJfb2ZfcmVwZWF0Jyxcblx0XHRcdHJ1bGVzOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0eXBlOiAnaW50ZWdlclswLi45OV0nLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLml2X1ZhbGlkYXRlUmVwZWF0TnVtYmVyT3V0T2ZSYW5nZSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSxcblx0fSxcblxuXHRpbml0aWFsaXplKCkge1xuXHRcdGl2ck1lbnUuJGRyb3BEb3ducy5kcm9wZG93bigpO1xuXG5cdFx0Ly8g0JTQuNC90LDQvNC40YfQtdGB0LrQsNGPINC/0YDQvtCy0L7QstC10YDQutCwINGB0LLQvtCx0L7QtNC10L0g0LvQuCDQstGL0LHRgNCw0L3QvdGL0Lkg0L3QvtC80LXRgFxuXHRcdGl2ck1lbnUuJG51bWJlci5vbignY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3TnVtYmVyID0gaXZyTWVudS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWUnLCAnZXh0ZW5zaW9uJyk7XG5cdFx0XHRFeHRlbnNpb25zLmNoZWNrQXZhaWxhYmlsaXR5KGl2ck1lbnUuZGVmYXVsdE51bWJlciwgbmV3TnVtYmVyKTtcblx0XHR9KTtcblxuXHRcdCQoJyNhZGQtbmV3LWl2ci1hY3Rpb24nKS5vbignY2xpY2snLCAoZWwpID0+IHtcblx0XHRcdGl2ck1lbnUuYWRkTmV3QWN0aW9uUm93KCk7XG5cdFx0XHRpdnJNZW51LnJlYnVpbGRBY3Rpb25FeHRlbnNpb25zRHJvcGRvd24oKTtcblx0XHRcdGl2ck1lbnUuJGRpcnJ0eUZpZWxkLnZhbChNYXRoLnJhbmRvbSgpKTtcblx0XHRcdGl2ck1lbnUuJGRpcnJ0eUZpZWxkLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHRcdFx0ZWwucHJldmVudERlZmF1bHQoKTtcblx0XHR9KTtcblx0XHRpdnJNZW51LmluaXRpYWxpemVGb3JtKCk7XG5cblx0XHRpdnJNZW51LmJ1aWxkSXZyTWVudUFjdGlvbnMoKTtcblxuXHRcdGl2ck1lbnUuZGVmYXVsdEV4dGVuc2lvbiA9IGl2ck1lbnUuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgJ2V4dGVuc2lvbicpO1xuXHR9LFxuXHQvKipcblx0ICogQ3JlYXRlIGl2ciBtZW51IGl0ZW1zIG9uIHRoZSBmb3JtXG5cdCAqL1xuXHRidWlsZEl2ck1lbnVBY3Rpb25zKCkge1xuXHRcdGNvbnN0IG9iakFjdGlvbnMgPSBKU09OLnBhcnNlKGl2ckFjdGlvbnMpO1xuXHRcdG9iakFjdGlvbnMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuXHRcdFx0aXZyTWVudS5hZGROZXdBY3Rpb25Sb3coZWxlbWVudCk7XG5cdFx0fSk7XG5cdFx0aWYgKG9iakFjdGlvbnMubGVuZ3RoID09PSAwKSBpdnJNZW51LmFkZE5ld0FjdGlvblJvdygpO1xuXG5cdFx0aXZyTWVudS5yZWJ1aWxkQWN0aW9uRXh0ZW5zaW9uc0Ryb3Bkb3duKCk7XG5cdH0sXG5cdGFkZE5ld0Zvcm1SdWxlcyhuZXdSb3dJZCkge1xuXHRcdGNvbnN0ICRkaWdpdHNDbGFzcyA9IGBkaWdpdHMtJHtuZXdSb3dJZH1gO1xuXHRcdGl2ck1lbnUudmFsaWRhdGVSdWxlc1skZGlnaXRzQ2xhc3NdID0ge1xuXHRcdFx0aWRlbnRpZmllcjogJGRpZ2l0c0NsYXNzLFxuXHRcdFx0cnVsZXM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdyZWdFeHBbL15bMC05XXsxLDd9JC9dJyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5pdl9WYWxpZGF0ZURpZ2l0c0lzTm90Q29ycmVjdCxcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHR5cGU6ICdjaGVja0RvdWJsZXNEaWdpdHMnLFxuXHRcdFx0XHRcdHByb21wdDogZ2xvYmFsVHJhbnNsYXRlLml2X1ZhbGlkYXRlRGlnaXRzSXNOb3RDb3JyZWN0LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblxuXHRcdH07XG5cdFx0Y29uc3QgJGV4dGVuc2lvbkNsYXNzID0gYGV4dGVuc2lvbi0ke25ld1Jvd0lkfWA7XG5cdFx0aXZyTWVudS52YWxpZGF0ZVJ1bGVzWyRleHRlbnNpb25DbGFzc10gPSB7XG5cdFx0XHRpZGVudGlmaWVyOiAkZXh0ZW5zaW9uQ2xhc3MsXG5cdFx0XHRydWxlczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dHlwZTogJ2VtcHR5Jyxcblx0XHRcdFx0XHRwcm9tcHQ6IGdsb2JhbFRyYW5zbGF0ZS5pdl9WYWxpZGF0ZUV4dGVuc2lvbklzTm90Q29ycmVjdCxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cblx0XHR9O1xuXHR9LFxuXHRhZGROZXdBY3Rpb25Sb3cocGFyYW1PYmopIHtcblx0XHRsZXQgcGFyYW0gPSB7XG5cdFx0XHRpZDogJycsXG5cdFx0XHRleHRlbnNpb246ICcnLFxuXHRcdFx0ZXh0ZW5zaW9uUmVwcmVzZW50OiAnJyxcblx0XHRcdGRpZ2l0czogJycsXG5cdFx0fTtcblx0XHRpZiAocGFyYW1PYmogIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyYW0gPSBwYXJhbU9iajtcblx0XHR9XG5cdFx0aXZyTWVudS5hY3Rpb25zUm93c0NvdW50ICs9IDE7XG5cdFx0Y29uc3QgJGFjdGlvblRlbXBsYXRlID0gaXZyTWVudS4kcm93VGVtcGxhdGUuY2xvbmUoKTtcblx0XHQkYWN0aW9uVGVtcGxhdGVcblx0XHRcdC5yZW1vdmVDbGFzcygnaGlkZGVuJylcblx0XHRcdC5hdHRyKCdpZCcsIGByb3ctJHtpdnJNZW51LmFjdGlvbnNSb3dzQ291bnR9YClcblx0XHRcdC5hdHRyKCdkYXRhLXZhbHVlJywgaXZyTWVudS5hY3Rpb25zUm93c0NvdW50KVxuXHRcdFx0LmF0dHIoJ3N0eWxlJywgJycpO1xuXG5cdFx0JGFjdGlvblRlbXBsYXRlLmZpbmQoJ2lucHV0W25hbWU9XCJkaWdpdHMtaWRcIl0nKVxuXHRcdFx0LmF0dHIoJ2lkJywgYGRpZ2l0cy0ke2l2ck1lbnUuYWN0aW9uc1Jvd3NDb3VudH1gKVxuXHRcdFx0LmF0dHIoJ25hbWUnLCBgZGlnaXRzLSR7aXZyTWVudS5hY3Rpb25zUm93c0NvdW50fWApXG5cdFx0XHQuYXR0cigndmFsdWUnLCBwYXJhbS5kaWdpdHMpO1xuXG5cdFx0JGFjdGlvblRlbXBsYXRlLmZpbmQoJ2lucHV0W25hbWU9XCJleHRlbnNpb24taWRcIl0nKVxuXHRcdFx0LmF0dHIoJ2lkJywgYGV4dGVuc2lvbi0ke2l2ck1lbnUuYWN0aW9uc1Jvd3NDb3VudH1gKVxuXHRcdFx0LmF0dHIoJ25hbWUnLCBgZXh0ZW5zaW9uLSR7aXZyTWVudS5hY3Rpb25zUm93c0NvdW50fWApXG5cdFx0XHQuYXR0cigndmFsdWUnLCBwYXJhbS5leHRlbnNpb24pO1xuXHRcdCRhY3Rpb25UZW1wbGF0ZS5maW5kKCdkaXYuZGVsZXRlLWFjdGlvbi1yb3cnKVxuXHRcdFx0LmF0dHIoJ2RhdGEtdmFsdWUnLCBpdnJNZW51LmFjdGlvbnNSb3dzQ291bnQpO1xuXG5cdFx0aWYgKHBhcmFtLmV4dGVuc2lvblJlcHJlc2VudC5sZW5ndGggPiAwKSB7XG5cdFx0XHQkYWN0aW9uVGVtcGxhdGUuZmluZCgnZGl2LmRlZmF1bHQudGV4dCcpLnJlbW92ZUNsYXNzKCdkZWZhdWx0JykuaHRtbChwYXJhbS5leHRlbnNpb25SZXByZXNlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkYWN0aW9uVGVtcGxhdGUuZmluZCgnZGl2LmRlZmF1bHQudGV4dCcpLmh0bWwoZ2xvYmFsVHJhbnNsYXRlLmV4X1NlbGVjdE51bWJlcik7XG5cdFx0fVxuXG5cdFx0JCgnI2FjdGlvbnMtcGxhY2UnKS5hcHBlbmQoJGFjdGlvblRlbXBsYXRlKTtcblx0XHRpdnJNZW51LmFkZE5ld0Zvcm1SdWxlcyhpdnJNZW51LmFjdGlvbnNSb3dzQ291bnQpO1xuXHR9LFxuXHRyZWJ1aWxkQWN0aW9uRXh0ZW5zaW9uc0Ryb3Bkb3duKCkge1xuXHRcdCQoJyNpdnItbWVudS1mb3JtIC5mb3J3YXJkaW5nLXNlbGVjdCcpLmRyb3Bkb3duKEV4dGVuc2lvbnMuZ2V0RHJvcGRvd25TZXR0aW5nc1dpdGhvdXRFbXB0eShpdnJNZW51LmNiT25FeHRlbnNpb25TZWxlY3QpKTtcblx0XHQkKCcuZGVsZXRlLWFjdGlvbi1yb3cnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0Y29uc3QgaWQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtdmFsdWUnKTtcblx0XHRcdGRlbGV0ZSBpdnJNZW51LnZhbGlkYXRlUnVsZXNbYGRpZ2l0cy0ke2lkfWBdO1xuXHRcdFx0ZGVsZXRlIGl2ck1lbnUudmFsaWRhdGVSdWxlc1tgZXh0ZW5zaW9uLSR7aWR9YF07XG5cdFx0XHQkKGAjcm93LSR7aWR9YCkucmVtb3ZlKCk7XG5cdFx0XHRpdnJNZW51LiRkaXJydHlGaWVsZC52YWwoTWF0aC5yYW5kb20oKSk7XG5cdFx0XHRpdnJNZW51LiRkaXJydHlGaWVsZC50cmlnZ2VyKCdjaGFuZ2UnKTtcblx0XHR9KTtcblx0fSxcblx0Y2JCZWZvcmVTZW5kRm9ybShzZXR0aW5ncykge1xuXHRcdGxldCByZXN1bHQgPSBzZXR0aW5ncztcblxuXHRcdHJlc3VsdC5kYXRhID0gaXZyTWVudS4kZm9ybU9iai5mb3JtKCdnZXQgdmFsdWVzJyk7XG5cdFx0Y29uc3QgYXJyQWN0aW9ucyA9IFtdO1xuXG5cdFx0JCgnLmFjdGlvbi1yb3cnKS5lYWNoKChpbmRleCwgb2JqKSA9PiB7XG5cdFx0XHRjb25zdCByb3dJZCA9ICQob2JqKS5hdHRyKCdkYXRhLXZhbHVlJyk7XG5cdFx0XHRpZiAocm93SWQgPiAwKSB7XG5cdFx0XHRcdGFyckFjdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0ZGlnaXRzOiBpdnJNZW51LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsIGBkaWdpdHMtJHtyb3dJZH1gKSxcblx0XHRcdFx0XHRleHRlbnNpb246IGl2ck1lbnUuJGZvcm1PYmouZm9ybSgnZ2V0IHZhbHVlJywgYGV4dGVuc2lvbi0ke3Jvd0lkfWApLFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpZiAoYXJyQWN0aW9ucy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJlc3VsdCA9IGZhbHNlO1xuXHRcdFx0aXZyTWVudS4kZXJyb3JNZXNzYWdlcy5odG1sKGdsb2JhbFRyYW5zbGF0ZS5pdl9WYWxpZGF0ZU5vSVZSRXh0ZW5zaW9ucyk7XG5cdFx0XHRpdnJNZW51LiRmb3JtT2JqLmFkZENsYXNzKCdlcnJvcicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQuZGF0YS5hY3Rpb25zID0gSlNPTi5zdHJpbmdpZnkoYXJyQWN0aW9ucyk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdC8qKlxuXHQgKiDQodGA0LDQsdCw0YLRi9Cy0LDQtdGCINC/0YDQuCDQstGL0LHQvtGA0LUg0L3QvtC80LXRgNCwINC40Lcg0LLRi9C/0LDQtNCw0Y7RidC10LPQviDRgdC/0LjRgdC60LBcblx0ICovXG5cdGNiT25FeHRlbnNpb25TZWxlY3QoKSB7XG5cdFx0aXZyTWVudS4kZGlycnR5RmllbGQudmFsKE1hdGgucmFuZG9tKCkpO1xuXHRcdGl2ck1lbnUuJGRpcnJ0eUZpZWxkLnRyaWdnZXIoJ2NoYW5nZScpO1xuXHR9LFxuXHRjYkFmdGVyU2VuZEZvcm0oKSB7XG5cblx0fSxcblx0aW5pdGlhbGl6ZUZvcm0oKSB7XG5cdFx0Rm9ybS4kZm9ybU9iaiA9IGl2ck1lbnUuJGZvcm1PYmo7XG5cdFx0Rm9ybS51cmwgPSBgJHtnbG9iYWxSb290VXJsfWl2ci1tZW51L3NhdmVgO1xuXHRcdEZvcm0udmFsaWRhdGVSdWxlcyA9IGl2ck1lbnUudmFsaWRhdGVSdWxlcztcblx0XHRGb3JtLmNiQmVmb3JlU2VuZEZvcm0gPSBpdnJNZW51LmNiQmVmb3JlU2VuZEZvcm07XG5cdFx0Rm9ybS5jYkFmdGVyU2VuZEZvcm0gPSBpdnJNZW51LmNiQWZ0ZXJTZW5kRm9ybTtcblx0XHRGb3JtLmluaXRpYWxpemUoKTtcblx0fSxcbn07XG5cbiQuZm4uZm9ybS5zZXR0aW5ncy5ydWxlcy5jaGVja0RvdWJsZXNEaWdpdHMgPSAodmFsdWUpID0+IHtcblx0bGV0IGNvdW50ID0gMDtcblx0JChcImlucHV0W2lkXj0nZGlnaXRzJ11cIikuZWFjaCgoaW5kZXgsIG9iaikgPT4ge1xuXHRcdGlmIChpdnJNZW51LiRmb3JtT2JqLmZvcm0oJ2dldCB2YWx1ZScsIGAke29iai5pZH1gKSA9PT0gdmFsdWUpIGNvdW50ICs9IDE7XG5cdH0pO1xuXG5cdHJldHVybiAoY291bnQgPT09IDEpO1xufTtcblxuJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuXHRpdnJNZW51LmluaXRpYWxpemUoKTtcbn0pO1xuXG4iXX0=