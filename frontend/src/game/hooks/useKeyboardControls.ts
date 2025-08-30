import { useEffect } from "react";

export function useKeyboardControls(
    keysRef: React.MutableRefObject<{ up: boolean; down: boolean }>
) {
    useEffect(() => {
        const update = (pressed: boolean, key: string) => {
            if (key === "ArrowUp" || key === "w") keysRef.current.up = pressed;
            if (key === "ArrowDown" || key === "s") keysRef.current.down = pressed;
        };

        const onKeyDown = (e: KeyboardEvent) => update(true, e.key);
        const onKeyUp = (e: KeyboardEvent) => update(false, e.key);

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);
}

