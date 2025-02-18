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

import classNames from "classnames";
import { Room } from "matrix-js-sdk/src/matrix";
import React, { useContext } from "react";

import { IEmoji } from "../../../emoji";
import { ICustomEmoji } from "../../../emojipicker/customemoji";
import { _t } from "../../../languageHandler";
import ContextMenu, { aboveLeftOf, AboveLeftOf, useContextMenu } from "../../structures/ContextMenu";
import EmojiPicker from "../emojipicker/EmojiPicker";
import { CollapsibleButton } from "./CollapsibleButton";
import { OverflowMenuContext } from "./MessageComposerButtons";

interface IEmojiButtonProps {
    addEmoji: (emoji: ICustomEmoji | IEmoji) => boolean;
    menuPosition: AboveLeftOf;
    room: Room;
    className?: string;
}

export function EmojiButton({ addEmoji, menuPosition, room, className }: IEmojiButtonProps) {
    const overflowMenuCloser = useContext(OverflowMenuContext);
    const [menuDisplayed, button, openMenu, closeMenu] = useContextMenu();

    let contextMenu: React.ReactElement | null = null;
    if (menuDisplayed && button.current) {
        const position = menuPosition ?? aboveLeftOf(button.current.getBoundingClientRect());

        contextMenu = (
            <ContextMenu
                {...position}
                onFinished={() => {
                    closeMenu();
                    overflowMenuCloser?.();
                }}
                managed={false}
            >
                <EmojiPicker onChoose={addEmoji} showQuickReactions={true} room={room} />
            </ContextMenu>
        );
    }

    const computedClassName = classNames("mx_EmojiButton", className, {
        mx_EmojiButton_highlight: menuDisplayed,
    });

    // TODO: replace ContextMenuTooltipButton with a unified representation of
    // the header buttons and the right panel buttons
    return (
        <>
            <CollapsibleButton
                className={computedClassName}
                iconClassName="mx_EmojiButton_icon"
                onClick={openMenu}
                title={_t("Emoji")}
                inputRef={button}
            />

            {contextMenu}
        </>
    );
}
