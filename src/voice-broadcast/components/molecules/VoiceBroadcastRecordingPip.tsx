/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useRef, useState } from "react";

import { VoiceBroadcastControl, VoiceBroadcastInfoState, VoiceBroadcastRecording } from "../..";
import { useVoiceBroadcastRecording } from "../../hooks/useVoiceBroadcastRecording";
import { VoiceBroadcastHeader } from "../atoms/VoiceBroadcastHeader";
import { Icon as StopIcon } from "../../../../res/img/element-icons/Stop.svg";
import { Icon as PauseIcon } from "../../../../res/img/element-icons/pause.svg";
import { Icon as RecordIcon } from "../../../../res/img/element-icons/Record.svg";
import { Icon as MicrophoneIcon } from "../../../../res/img/element-icons/mic.svg";
import { _t } from "../../../languageHandler";
import { useAudioDeviceSelection } from "../../../hooks/useAudioDeviceSelection";
import { DevicesContextMenu } from "../../../components/views/audio_messages/DevicesContextMenu";
import AccessibleTooltipButton from "../../../components/views/elements/AccessibleTooltipButton";

interface VoiceBroadcastRecordingPipProps {
    recording: VoiceBroadcastRecording;
}

export const VoiceBroadcastRecordingPip: React.FC<VoiceBroadcastRecordingPipProps> = ({ recording }) => {
    const pipRef = useRef<HTMLDivElement | null>(null);
    const { live, timeLeft, recordingState, room, stopRecording, toggleRecording } =
        useVoiceBroadcastRecording(recording);
    const { currentDevice, devices, setDevice } = useAudioDeviceSelection();

    const onDeviceSelect = async (device: MediaDeviceInfo) => {
        setShowDeviceSelect(false);

        if (currentDevice.deviceId === device.deviceId) {
            // device unchanged
            return;
        }

        setDevice(device);

        if ([VoiceBroadcastInfoState.Paused, VoiceBroadcastInfoState.Stopped].includes(recordingState)) {
            // Nothing to do in these cases. Resume will use the selected device.
            return;
        }

        // pause and resume to switch the input device
        await recording.pause();
        await recording.resume();
    };

    const [showDeviceSelect, setShowDeviceSelect] = useState<boolean>(false);

    const toggleControl =
        recordingState === VoiceBroadcastInfoState.Paused ? (
            <VoiceBroadcastControl
                className="mx_VoiceBroadcastControl-recording"
                onClick={toggleRecording}
                icon={RecordIcon}
                label={_t("resume voice broadcast")}
            />
        ) : (
            <VoiceBroadcastControl onClick={toggleRecording} icon={PauseIcon} label={_t("pause voice broadcast")} />
        );

    return (
        <div className="mx_VoiceBroadcastBody mx_VoiceBroadcastBody--pip" ref={pipRef}>
            <VoiceBroadcastHeader linkToRoom={true} live={live ? "live" : "grey"} room={room} timeLeft={timeLeft} />
            <hr className="mx_VoiceBroadcastBody_divider" />
            <div className="mx_VoiceBroadcastBody_controls">
                {toggleControl}
                <AccessibleTooltipButton onClick={() => setShowDeviceSelect(true)} title={_t("Change input device")}>
                    <MicrophoneIcon className="mx_Icon mx_Icon_16 mx_Icon_alert" />
                </AccessibleTooltipButton>
                <VoiceBroadcastControl icon={StopIcon} label="Stop Recording" onClick={stopRecording} />
            </div>
            {showDeviceSelect && (
                <DevicesContextMenu
                    containerRef={pipRef}
                    currentDevice={currentDevice}
                    devices={devices}
                    onDeviceSelect={onDeviceSelect}
                />
            )}
        </div>
    );
};
