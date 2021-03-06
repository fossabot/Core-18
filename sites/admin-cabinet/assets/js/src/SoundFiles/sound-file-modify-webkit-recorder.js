/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 10 2020
 *
 */

/* global MediaStreamRecorder, StereoAudioRecorder, PbxApi, sndPlayer */
const webkitRecorder = {
	$recordLabel: $('#record-label'),
	$recordButton: $('#start-record-button'),
	$stopButton: $('#stop-record-button'),
	$selectAudioInput: $('#select-audio-button'),
	$audioPlayer: $('#audio-player'),
	audioInputMenu: document.getElementById('audio-input-select'),
	chunks: [],
	mediaRecorder: '',
	initialize() {
		webkitRecorder.$stopButton.addClass('disabled');

		webkitRecorder.$recordButton.on('click', (e) => {
			e.preventDefault();
			webkitRecorder.chunks = [];
			let constraints = {
				audio: true,
			};
			if (webkitRecorder.audioInputMenu.getElementsByClassName('selected').length > 0) {
				const audioSource = webkitRecorder.audioInputMenu.getElementsByClassName('selected')[0].id;
				constraints = {
					audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
				};
			}
			console.log(constraints);
			webkitRecorder.captureUserMedia(
				constraints,
				webkitRecorder.cbOnSuccess,
				webkitRecorder.gotDevices,
				webkitRecorder.onError,
			);
		});
		webkitRecorder.$stopButton.on('click', (e) => {
			e.preventDefault();
			webkitRecorder.mediaRecorder.stop();
		});

		webkitRecorder.$selectAudioInput.dropdown();

		if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
			$('#only-https-field').addClass('disabled');
		}
		if (window.navigator.userAgent.indexOf('MSIE ') > 0) {
			$('#only-https-field').addClass('disabled');
		}
	},
	captureUserMedia(mediaConstraints, successCallback, gotDevicesCallBack, errorCallback) {
		navigator
			.mediaDevices.getUserMedia(mediaConstraints)
			.then(successCallback)
			.then(gotDevicesCallBack)
			.catch(errorCallback);
	},
	gotDevices(deviceInfos) {
		if (webkitRecorder.audioInputMenu.getElementsByTagName('div').length > 0) return;
		for (let i = 0; i !== deviceInfos.length; i += 1) {
			const deviceInfo = deviceInfos[i];
			const option = document.createElement('div');
			option.className = 'item';
			option.id = deviceInfo.deviceId;
			if (deviceInfo.kind === 'audioinput') {
				option.innerHTML = deviceInfo.label ||
					`microphone ${webkitRecorder.audioInputMenu.length + 1}`;
				webkitRecorder.audioInputMenu.appendChild(option);
			}
		}
		if (webkitRecorder.audioInputMenu.getElementsByTagName('div').length > 0) {
			webkitRecorder.$selectAudioInput.removeClass('disabled');
		}
	},
	cbOnSuccess(stream) {
		try {
			webkitRecorder.mediaRecorder = new MediaStreamRecorder(stream);
			webkitRecorder.mediaRecorder.stream = stream;
			webkitRecorder.mediaRecorder.recorderType = StereoAudioRecorder;
			webkitRecorder.mediaRecorder.mimeType = 'audio/wav';
			webkitRecorder.mediaRecorder.audioChannels = 1;

			// webkitRecorder.mediaRecorder = new MediaRecorder(stream);
			webkitRecorder.mediaRecorder.onstop = webkitRecorder.cbOnStopMediaRecorder;
			webkitRecorder.mediaRecorder.ondataavailable = webkitRecorder.cbOnDataAvailable;
			webkitRecorder.mediaRecorder.start(300000);
			console.log('recorder started');
			webkitRecorder.$recordLabel.addClass('red');
			webkitRecorder.$stopButton.removeClass('disabled');
			webkitRecorder.$recordButton.addClass('disabled');
			return navigator.mediaDevices.enumerateDevices();
		} catch (e) {
			console.error('MediaStreamRecorder is not supported by this browser.\n\n' +
				'Try Firefox 29 or later, or Chrome 47 or later, with Enable experimental Web Platform features enabled from chrome://flags.');
			console.error('Exception while creating MediaRecorder:', e);
			webkitRecorder.$recordButton.addClass('disabled');
		}
		return false;
	},
	cbOnError(err) {
		console.log(`The following error occured: ${err}`);
	},
	cbOnStopMediaRecorder() {
		console.log('data available after MediaStreamRecorder.stop() called.');
		soundFileModify.blob = new Blob(webkitRecorder.chunks);
		console.log('recorder stopped');
		const fileURL = URL.createObjectURL(soundFileModify.blob);
		sndPlayer.UpdateSource(fileURL);
		const blobFile = new File([webkitRecorder.chunks[0]], 'blob'+ new Date().getTime()+'.wav');
		PbxApi.FilesUploadFile(blobFile, soundFileModify.cbUploadResumable);
		webkitRecorder.$recordLabel.removeClass('red');
		webkitRecorder.$stopButton.addClass('disabled');
		webkitRecorder.$recordButton.removeClass('disabled');
		soundFileModify.$soundFileInput.val('');
	},
	cbOnDataAvailable(e) {
		webkitRecorder.chunks.push(e);
	},
};


$(document).ready(() => {
	webkitRecorder.initialize();
});
