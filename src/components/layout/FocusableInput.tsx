import React, { useEffect, useRef, useState } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation-react";
import {
  pause,
  resume,
  navigateByDirection,
} from "@noriginmedia/norigin-spatial-navigation-core";
import { settingsStorage } from "../../lib/storage";
import { useModalFocus, useIsInModal } from "../../lib/context/ModalFocusContext";
import { useKeyboardNavActive } from "../../lib/hooks/useKeyboardNavActive";

export interface FocusableInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onFocus" | "onBlur"> {
  focusKey?: string;
  onEnterPress?: () => void;
  onArrowPress?: (direction: string) => boolean;
  wrapperClassName?: string;
  startIcon?: React.ReactNode;
}

export const FocusableInput: React.FC<FocusableInputProps> = ({
  focusKey,
  onEnterPress,
  onArrowPress,
  className = "",
  wrapperClassName = "",
  startIcon,
  disabled = false,
  onKeyDown,
  ...inputProps
}) => {
  const tvMode = settingsStorage.isTvModeEnabled();
  // Outside TV mode, show the ring only while keyboard or controller is in use.
  const showRing = useKeyboardNavActive() || tvMode;
  const { isModalOpen } = useModalFocus();
  const isInModal = useIsInModal();
  const blockedByModal = isModalOpen && !isInModal;

  const [isTyping, setIsTyping] = useState(false);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const typingRef = useRef(false);
  useEffect(() => {
    return () => {
      if (typingRef.current) resume();
    };
  }, []);

  const beginTyping = () => {
    const input = nativeInputRef.current;
    if (!input || disabled) return;
    typingRef.current = true;
    pause();
    input.readOnly = false;
    setIsTyping(true);
    // Keep native keyboard activation within the remote Select event.
    input.focus();
  };

  const finishTyping = () => {
    typingRef.current = false;
    setIsTyping(false);
    resume();
  };

  const { ref, focused, focusSelf } = useFocusable({
    focusKey,
    focusable: (isInModal || tvMode) && !disabled && !blockedByModal,
    onArrowPress,
    onEnterPress: () => {
      onEnterPress?.();
      beginTyping();
    },
  });

  return (
    <div
      ref={ref as any}
      tabIndex={-1}
      className={`focusable-input-wrapper ${wrapperClassName} ${
        focused && showRing ? "tv-focus" : ""
      }`.trim()}
      onClick={beginTyping}
    >
      {startIcon}
      <input
        ref={nativeInputRef}
        disabled={disabled}
        readOnly={!isTyping}
        tabIndex={isTyping ? 0 : -1}
        onBlur={finishTyping}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Enter") {
            finishTyping();
            focusSelf();
          } else if (event.key === "Escape") {
            nativeInputRef.current?.blur();
            finishTyping();
            focusSelf();
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? "down" : "up";
            nativeInputRef.current?.blur();
            finishTyping();
            if (onArrowPress) {
              const allowDefault = onArrowPress(direction);
              if (allowDefault) {
                navigateByDirection(direction);
              }
            } else {
              navigateByDirection(direction);
            }
            return;
          }
          if (isTyping && event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            event.stopPropagation();
          }
        }}
        className={className}
        {...inputProps}
      />
    </div>
  );
};
