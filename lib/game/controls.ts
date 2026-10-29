export type InputState = {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
};

export function createInputState(): InputState {
  return {
    forward: false,
    back: false,
    left: false,
    right: false,
  };
}

function setFromKey(input: InputState, key: string, pressed: boolean) {
  switch (key) {
    case "w":
    case "arrowup":
      input.forward = pressed;
      break;
    case "s":
    case "arrowdown":
      input.back = pressed;
      break;
    case "a":
    case "arrowleft":
      input.left = pressed;
      break;
    case "d":
    case "arrowright":
      input.right = pressed;
      break;
  }
}

export function attachKeyboardControls(input: InputState): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (
      key === "arrowup" ||
      key === "arrowdown" ||
      key === "arrowleft" ||
      key === "arrowright" ||
      key === "w" ||
      key === "a" ||
      key === "s" ||
      key === "d"
    ) {
      e.preventDefault();
    }
    setFromKey(input, key, true);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    setFromKey(input, e.key.toLowerCase(), false);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
  };
}

export type Direction = "forward" | "back" | "left" | "right";

export function setDirection(
  input: InputState,
  direction: Direction,
  pressed: boolean,
) {
  input[direction] = pressed;
}
