/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global PbxApi, globalTranslate, UserMessage */
class PbxExtensionStatus {
	initialize(uniqid, changeLabel = true) {
		this.$toggle = $(`.ui.toggle.checkbox[data-value="${uniqid}"]`);
		this.$allToggles = $(`.ui.toggle.checkbox`);
		this.$statusIcon = $(`tr#${uniqid} i.status-icon`);
		if (changeLabel) {
			this.$label = $(`.ui.toggle.checkbox[data-value="${uniqid}"]`).find('label');
		} else {
			this.$label = false;
		}
		this.uniqid = uniqid;
		this.$disabilityFields = $(`tr#${uniqid} .disability`);
		const cbOnChecked = $.proxy(this.cbOnChecked, this);
		const cbOnUnchecked = $.proxy(this.cbOnUnchecked, this);
		this.$toggle.checkbox({
			onChecked: cbOnChecked,
			onUnchecked: cbOnUnchecked,
		});
	}
	changeLabelText(newText) {
		if (this.$label) {
			this.$label.text(newText);
		}
	}
	cbOnChecked() {
		this.$statusIcon.addClass('spinner loading icon');
		this.$allToggles.addClass('disabled');
		$('a.button').addClass('disabled');
		this.changeLabelText(globalTranslate.ext_ModuleStatusChanging);
		const cbAfterModuleEnable = $.proxy(this.cbAfterModuleEnable, this);
		PbxApi.SystemEnableModule(this.uniqid, cbAfterModuleEnable);
	}
	cbOnUnchecked() {
		this.$statusIcon.addClass('spinner loading icon');
		this.$allToggles.addClass('disabled');
		$('a.button').addClass('disabled');
		this.changeLabelText(globalTranslate.ext_ModuleStatusChanging);
		const cbAfterModuleDisable = $.proxy(this.cbAfterModuleDisable, this);
		PbxApi.SystemDisableModule(this.uniqid, cbAfterModuleDisable);
	}
	cbAfterModuleDisable(response, success) {
		if (success) {
			this.$toggle.checkbox('set unchecked');
			this.$statusIcon.removeClass('spinner loading icon');
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusDisabled);
			const event = document.createEvent('Event');
			event.initEvent('ModuleStatusChanged', false, true);
			window.dispatchEvent(event);
			event.initEvent('ConfigDataChanged', false, true);
			window.dispatchEvent(event);
			this.$disabilityFields.addClass('disabled');
			if (response.data.changedObjects !== undefined){
				UserMessage.showMultiString(response.data.changedObjects, globalTranslate.ext_ModuleChangedObjects);
			}
		} else {
			this.$toggle.checkbox('set checked');
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusEnabled);
			this.$disabilityFields.removeClass('disabled');
			if (response !== undefined && response.messages !== undefined) {
				UserMessage.showMultiString(response.messages, globalTranslate.ext_ModuleChangeStatusError);
			}
		}
		this.$allToggles.removeClass('disabled');
		$('a.button').removeClass('disabled');
		this.$statusIcon.removeClass('spinner loading icon');
	}
	cbAfterModuleEnable(response, success) {
		if (success) {
			this.$toggle.checkbox('set checked');
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusEnabled);
			const event = document.createEvent('Event');
			event.initEvent('ModuleStatusChanged', false, true);
			window.dispatchEvent(event);
			event.initEvent('ConfigDataChanged', false, true);
			window.dispatchEvent(event);
			this.$disabilityFields.removeClass('disabled');
			if (response.data.changedObjects !== undefined){
				UserMessage.showMultiString(response.data.changedObjects, globalTranslate.ext_ModuleChangedObjects);
			}
		} else {
			this.$toggle.checkbox('set unchecked');
			this.changeLabelText(globalTranslate.ext_ModuleDisabledStatusDisabled);
			this.$disabilityFields.addClass('disabled');
			if (response !== undefined && response.messages !== undefined) {
				UserMessage.showMultiString(response.messages, globalTranslate.ext_ModuleChangeStatusError);
			}
		}
		this.$allToggles.removeClass('disabled');
		this.$statusIcon.removeClass('spinner loading icon');
		$('a.button').removeClass('disabled');
	}
}

$(document).ready(() => {
	const uniqId = $('#module-status-toggle').attr('data-value');
	if (uniqId) {
		const pageStatus = new PbxExtensionStatus();
		pageStatus.initialize(uniqId, true);
	}
});
